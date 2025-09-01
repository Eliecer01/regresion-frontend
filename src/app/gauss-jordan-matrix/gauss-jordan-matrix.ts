import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegressionService } from '../service/RegressionService';
import { InverseMatrixResponse } from '../models/InverseMatrixResponse.model';
import { MatrixData } from '../models/MatrixData';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gauss-jordan-matrix',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gauss-jordan-matrix.html',
  styleUrls: ['./gauss-jordan-matrix.scss'],
})
export class GaussJordanMatrixComponent {
  @Input() matrixData: MatrixData | null = null;
  @Input() title: string = 'Matriz Aumentada para Gauss-Jordan';

  inverseMatrix: InverseMatrixResponse | null = null;
  multiplicationMatrix: number[][] | null = null;
  calculatedCoefficients: number[] = [];
  isLoading = false;
  error: string | null = null;
  estimationX1: number | null = null;
  estimationX2: number | null = null;
  estimationResult: number | null = null;
  showEstimationForm: boolean = false;

  constructor(private regressionService: RegressionService, private cdRef: ChangeDetectorRef) {}

  get augmentedMatrix(): number[][] {
    if (!this.matrixData) return [];
    return [
      [this.matrixData.n, this.matrixData.sumX1, this.matrixData.sumX2, 1, 0, 0],
      [this.matrixData.sumX1, this.matrixData.sumX1Squared, this.matrixData.sumX1x2, 0, 1, 0],
      [this.matrixData.sumX2, this.matrixData.sumX1x2, this.matrixData.sumX2Squared, 0, 0, 1],
    ];
  }

  // NUEVO MÉTODO: Calcular matriz de multiplicación
  calculateMultiplicationMatrix(): void {
    if (!this.inverseMatrix || !this.matrixData) return;

    const inverse = this.inverseMatrix.matrix;
    const vectorB = [
      this.matrixData.sumY, // ΣY
      this.matrixData.sumX1y, // ΣX₁Y
      this.matrixData.sumX2y, // ΣX₂Y
    ];

    this.multiplicationMatrix = [
      [
        inverse[0][0] * vectorB[0], // A⁻¹[0][0] * ΣY
        inverse[0][1] * vectorB[1], // A⁻¹[0][1] * ΣX₁Y
        inverse[0][2] * vectorB[2], // A⁻¹[0][2] * ΣX₂Y
      ],
      [
        inverse[1][0] * vectorB[0], // A⁻¹[1][0] * ΣY
        inverse[1][1] * vectorB[1], // A⁻¹[1][1] * ΣX₁Y
        inverse[1][2] * vectorB[2], // A⁻¹[1][2] * ΣX₂Y
      ],
      [
        inverse[2][0] * vectorB[0], // A⁻¹[2][0] * ΣY
        inverse[2][1] * vectorB[1], // A⁻¹[2][1] * ΣX₁Y
        inverse[2][2] * vectorB[2], // A⁻¹[2][2] * ΣX₂Y
      ],
    ];
  }

  calculateInverse(): void {
    if (!this.matrixData) return;

    this.isLoading = true;
    this.error = null;
    this.multiplicationMatrix = null; // ← Resetear matriz de multiplicación

    const matrixData = {
      n: this.matrixData.n,
      sumX1: this.matrixData.sumX1,
      sumX2: this.matrixData.sumX2,
      sumX1Squared: this.matrixData.sumX1Squared,
      sumX2Squared: this.matrixData.sumX2Squared,
      sumX1x2: this.matrixData.sumX1x2,
      sumY: this.matrixData.sumY, // ← Asegurar que se envíen
      sumX1y: this.matrixData.sumX1y, // ← estos valores al backend
      sumX2y: this.matrixData.sumX2y, // ←
    };

    console.log('Enviando al backend:', matrixData);

    this.regressionService.calculateInverseMatrix(matrixData).subscribe({
      next: (response) => {
        console.log('Respuesta completa:', response);

        if (!response || !response.matrix || !response.coefficients) {
          throw new Error('Respuesta inválida del servidor');
        }

        this.inverseMatrix = response;

        this.multiplicationMatrix = response.multiplicationMatrix || null;
        this.calculatedCoefficients = response.rowSumCoefficients || [];

        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Error detallado:', error);
        this.error = error.message || 'Error al calcular la matriz inversa';
        this.isLoading = false;
      },
    });
  }

  calculateEstimation(): void {
    if (
      this.estimationX1 === null ||
      this.estimationX2 === null ||
      this.calculatedCoefficients.length !== 3
    ) {
      this.estimationResult = null;
      return;
    }

    const a = this.calculatedCoefficients[0]; // intercepto
    const b1 = this.calculatedCoefficients[1]; // coeficiente X₁
    const b2 = this.calculatedCoefficients[2]; // coeficiente X₂

    this.estimationResult = a + b1 * this.estimationX1 + b2 * this.estimationX2;
  }

  formatNumber(value: number): string {
    if (value === null || value === undefined) return '0.0';
    const formatted = value.toFixed(0);
    return formatted.replace(',', '.');
  }

  formatNumberInverseMatrix(value: number): string {
    if (value === null || value === undefined) return '0.0';
    const formatted = value.toFixed(4);
    return formatted.replace(',', '.');
  }

  // Formatear números para la matriz de multiplicación
  formatMultiplicationNumber(value: number): string {
    if (value === null || value === undefined) return '0.0';
    const formatted = value.toFixed(4);
    return formatted.replace(',', '.');
  }

  formatEstimationResult(value: number): string {
    if (value === null || value === undefined) return '0.0';
    const formatted = value.toFixed(4);
    return formatted.replace(',', '.');
  }

  // Toggle para mostrar/ocultar formulario de estimación
  toggleEstimationForm(): void {
    this.showEstimationForm = !this.showEstimationForm;
  }
}
