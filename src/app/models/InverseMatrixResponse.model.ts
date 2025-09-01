export interface InverseMatrixResponse {
  matrix: number[][];
  coefficients: number[];
  equation: string;
  multiplicationMatrix?: number[][];
  rowSumCoefficients?: number[]; 
}