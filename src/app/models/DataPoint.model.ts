export interface DataPoint {
  id: number;
  y: number | null;
  x1: number | null;
  x2: number | null;
  x1Squared?: number | null;
  x2Squared?: number | null;
  x1x2?: number | null;
  x1y?: number | null;
  x2y?: number | null;
}
