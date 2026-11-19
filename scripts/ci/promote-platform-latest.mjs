/**
 * Promote platform package `latest` dist-tag and remove legacy `release-*` tags.
 *
 * OIDC Trusted Publisher can publish tarballs but cannot dist-tag on some packages.
 * Run locally after a tag publish when CI logs show 401 on dist-tag add.
 *
 * Reads npmTotpSecret / npmOtp from .secrets/nifty.json (same as nifty trust).
 *
 * Usage:
 *   node scripts/ci/promote-platform-latest.mjs 0.0.2
 */

import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SECRETS_PATH = path.join(ROOT, ".secrets", "nifty.json");

const PLATFORM_PACKAGES = [
    "@doki-land/fractal-win32-x64",
    "@doki-land/fractal-linux-x64",
    "@doki-land/fractal-linux-arm64",
    "@doki-land/fractal-darwin-x64",
    "@doki-land/fractal-darwin-arm64",
    "@doki-land/fractal-unknown-wasm32",
];

const LEGACY_TAGS = /^release-\d+\.\d+\.\d+/;

function loadSecretsFile(filePath) {
    /** @type {Record<string, string>} */
    let text;
    try {
        text = fs.readFileSync(filePath, "utf8");
    } catch (err) {
        if (err.code === "ENOENT") return {};
        throw err;
    }
    return JSON.parse(text);
}

function decodeBase32(secret) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    const cleaned = secret.replace(/[\s=-]/g, "").toUpperCase();
    let bits = "";
    for (const ch of cleaned) {
        const v = alphabet.indexOf(ch);
        if (v < 0) throw new Error("invalid base32 in TOTP secret");
        bits += v.toString(2).padStart(5, "0");
    }
    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
    }
    if (!bytes.length) throw new Error("TOTP secret decoded empty");
    return Buffer.from(bytes);
}

function totpCode(secret) {
    const key = decodeBase32(secret);
    const counter = Math.floor(Date.now() / 1000 / 30);
    const buf = Buffer.alloc(8);
    buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
    buf.writeUInt32BE(counter & 0xffffffff, 4);
    const hmac = crypto.createHmac("sha1", key).update(buf).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);
    return String(code % 1_000_000).padStart(6, "0");
}

const secrets = loadSecretsFile(SECRETS_PATH);
const isSixDigit = (v) => typeof v === "string" && /^\d{6}$/.test(v.trim());
const totpSecret = secrets.npmTotpSecret ?? (!isSixDigit(secrets.npmOtp) ? secrets.npmOtp : undefined);
const staticOtp = isSixDigit(secrets.npmOtp) ? secrets.npmOtp : undefined;
const otp = totpSecret ? totpCode(totpSecret) : staticOtp;

if (!otp) {
    console.error("promote-platform-latest: set npmTotpSecret in .secrets/nifty.json");
    process.exit(1);
}

const version = process.argv[2]?.replace(/^v/, "");
if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
    console.error("promote-platform-latest: usage: node scripts/ci/promote-platform-latest.mjs 0.0.2");
    process.exit(1);
}

const REGISTRY = "https://registry.npmjs.org/";

function runNpm(args) {
    const r = spawnSync("npm", [...args, "--registry", REGISTRY, `--otp=${otp}`], {
        encoding: "utf8",
        shell: process.platform === "win32",
        stdio: "pipe",
    });
    return {
        status: r.status ?? 1,
        stdout: String(r.stdout ?? "").trim(),
        stderr: String(r.stderr ?? "").trim(),
    };
}

function viewVersion(name) {
    const r = spawnSync("npm", ["view", `${name}@${version}`, "version", "--registry", REGISTRY], {
        encoding: "utf8",
        shell: process.platform === "win32",
    });
    return r.status === 0 ? String(r.stdout ?? "").trim() : null;
}

function listTags(name) {
    const r = spawnSync("npm", ["dist-tag", "ls", name, "--json", "--registry", REGISTRY], {
        encoding: "utf8",
        shell: process.platform === "win32",
    });
    if (r.status !== 0 || !r.stdout) return {};
    try {
        return JSON.parse(String(r.stdout));
    } catch {
        return {};
    }
}

let ok = 0;
let skipped = 0;

for (const name of PLATFORM_PACKAGES) {
    if (viewVersion(name) !== version) {
        console.log(`· ${name}@${version} not on registry — skip`);
        skipped += 1;
        continue;
    }

    const tags = listTags(name);
    const currentLatest = tags.latest;

    if (currentLatest !== version) {
        console.log(`\n=== ${name}@${version} dist-tag add latest (was ${currentLatest ?? "?"}) ===`);
        const add = runNpm(["dist-tag", "add", `${name}@${version}`, "latest"]);
        process.stdout.write(`${add.stdout}\n${add.stderr}\n`);
        if (add.status !== 0 && !/already set/i.test(`${add.stdout}\n${add.stderr}`)) {
            console.error(`promote-platform-latest: failed latest for ${name}`);
            process.exit(1);
        }
    } else {
        console.log(`✓ ${name} latest already ${version}`);
    }

    for (const tag of Object.keys(tags)) {
        if (tag === "latest" || !LEGACY_TAGS.test(tag)) continue;
        console.log(`  rm ${name} dist-tag ${tag} (${tags[tag]})`);
        const rm = runNpm(["dist-tag", "rm", name, tag]);
        if (rm.status !== 0 && !/does not exist|not found/i.test(`${rm.stdout}\n${rm.stderr}`)) {
            process.stderr.write(`${rm.stdout}\n${rm.stderr}\n`);
        }
    }
    ok += 1;
}

console.log(`\npromote-platform-latest: done (${ok} promoted/checked, ${skipped} missing @${version})`);
