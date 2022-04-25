export type PlantGrowResult = {
    points: string;
    viewBox: string;
    source: string;
    sourceLength: number;
};

/** Parallel L-system rewrite. `rules` is a flat `[from, to, from, to, …]` list. */
export function rewrite(axiom: string, rules: string[], iterations: number): string;

/** Grow the classic plant L-system and return SVG polyline fields. */
export function growPlant(
    iterations: number,
    step: number,
    turnDegrees: number,
    padding: number,
): PlantGrowResult;

declare const binding: {
    rewrite: typeof rewrite;
    growPlant: typeof growPlant;
};

export default binding;
