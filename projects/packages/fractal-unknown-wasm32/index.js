import init, {
    boxCountingDimension,
    correlationDimension,
    growFern,
    growMelody,
    growPlant,
    growSierpinski,
    julia,
    logisticLyapunov,
    logisticLyapunovScan,
    mandelbrot,
    rewrite,
    sampleClifford,
    sampleDejong,
    sampleIfs,
    sampleLorenz,
} from "./lib/fractal_wasm.js";

const wasmUrl = new URL("./lib/fractal_wasm_bg.wasm", import.meta.url);
await init(wasmUrl);

const binding = {
    rewrite,
    growPlant,
    growFern,
    sampleIfs,
    growSierpinski,
    sampleClifford,
    sampleDejong,
    sampleLorenz,
    mandelbrot,
    julia,
    growMelody,
    boxCountingDimension,
    correlationDimension,
    logisticLyapunov,
    logisticLyapunovScan,
};

export default binding;
