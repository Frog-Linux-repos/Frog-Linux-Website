declare module "poly-decomp" {
  type Polygon = [number, number][];
  const decomp: {
    makeCCW(polygon: Polygon): boolean;
    quickDecomp(polygon: Polygon): Polygon[];
    removeCollinearPoints(polygon: Polygon, threshold: number): number;
    removeDuplicatePoints(polygon: Polygon, precision: number): void;
  };
  export default decomp;
}
