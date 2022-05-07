/** Pure-TS geometry → SVG / Canvas. Compute stays in Rust (NAPI / WASM). */

export type Point2 = { x: number; y: number };

export type PlantPath = {
    points: Point2[];
    source: string;
    sourceLength: number;
};

export type FitBounds = {
    minX: number;
    minY: number;
    width: number;
    height: number;
};

export type SvgPolyline = {
    points: string;
    viewBox: string;
};

export type CanvasStrokeOptions = {
    padding?: number;
    strokeStyle?: string;
    lineWidth?: number;
    background?: string;
};

export type CanvasPlotOptions = {
    padding?: number;
    fillStyle?: string;
    pointSize?: number;
    background?: string;
};

/** Axis-aligned bounds of a turtle path. */
export function fitBounds(points: Point2[], padding = 16): FitBounds {
    if (points.length === 0) {
        return { minX: 0, minY: 0, width: 100, height: 100 };
    }
    let minX = points[0].x;
    let minY = points[0].y;
    let maxX = points[0].x;
    let maxY = points[0].y;
    for (const p of points) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
    }
    const width = Math.max(maxX - minX, 1) + padding * 2;
    const height = Math.max(maxY - minY, 1) + padding * 2;
    return { minX: minX - padding, minY: minY - padding, width, height };
}

/** Serialize turtle points into SVG `<polyline points>` + `viewBox`. */
export function toSvgPolyline(points: Point2[], padding = 16): SvgPolyline {
    const box = fitBounds(points, padding);
    if (points.length === 0) {
        return { points: "", viewBox: "0 0 100 100" };
    }
    const serialized = points
        .map((p) => `${(p.x - box.minX).toFixed(2)},${(p.y - box.minY).toFixed(2)}`)
        .join(" ");
    return {
        points: serialized,
        viewBox: `0 0 ${box.width.toFixed(2)} ${box.height.toFixed(2)}`,
    };
}

/** Stroke turtle points onto a 2D canvas (device pixels = canvas width/height). */
export function strokeCanvas(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    points: Point2[],
    options: CanvasStrokeOptions = {},
): void {
    const padding = options.padding ?? 16;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    if (!ctx) {
        throw new Error("2D canvas context unavailable");
    }
    const width = "width" in canvas ? Number(canvas.width) : 0;
    const height = "height" in canvas ? Number(canvas.height) : 0;
    ctx.clearRect(0, 0, width, height);
    if (options.background) {
        ctx.fillStyle = options.background;
        ctx.fillRect(0, 0, width, height);
    }
    if (points.length < 2) {
        return;
    }
    const box = fitBounds(points, padding);
    const sx = width / box.width;
    const sy = height / box.height;
    const scale = Math.min(sx, sy);
    const ox = (width - box.width * scale) / 2;
    const oy = (height - box.height * scale) / 2;

    ctx.beginPath();
    ctx.strokeStyle = options.strokeStyle ?? "#52c41a";
    ctx.lineWidth = options.lineWidth ?? 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    for (let i = 0; i < points.length; i++) {
        const x = ox + (points[i].x - box.minX) * scale;
        const y = oy + (points[i].y - box.minY) * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}

/** Plot an IFS / chaos-game point cloud onto a 2D canvas. */
export function plotCanvas(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    points: Point2[],
    options: CanvasPlotOptions = {},
): void {
    const padding = options.padding ?? 16;
    const pointSize = options.pointSize ?? 1;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    if (!ctx) {
        throw new Error("2D canvas context unavailable");
    }
    const width = "width" in canvas ? Number(canvas.width) : 0;
    const height = "height" in canvas ? Number(canvas.height) : 0;
    ctx.clearRect(0, 0, width, height);
    if (options.background) {
        ctx.fillStyle = options.background;
        ctx.fillRect(0, 0, width, height);
    }
    if (points.length === 0) {
        return;
    }
    const box = fitBounds(points, padding);
    const scale = Math.min(width / box.width, height / box.height);
    const ox = (width - box.width * scale) / 2;
    const oy = (height - box.height * scale) / 2;

    ctx.fillStyle = options.fillStyle ?? "#389e0d";
    for (const p of points) {
        const x = ox + (p.x - box.minX) * scale;
        const y = oy + (p.y - box.minY) * scale;
        ctx.fillRect(x, y, pointSize, pointSize);
    }
}
