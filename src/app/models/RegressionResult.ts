// regression-result.model.ts
export interface RegressionResult {
  coefficients: number[];
  rsquared: number;
  equation: string;
  matrix?: number[][];
  inverseMatrix?: number[][];
}