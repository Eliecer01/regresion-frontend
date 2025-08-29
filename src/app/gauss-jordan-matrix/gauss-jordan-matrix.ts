import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegressionService } from '../service/RegressionService';
import { InverseMatrixResponse } from '../models/InverseMatrixResponse.model';
import { MatrixData } from '../models/MatrixData';

@Component({
  selector: 'app-gauss-jordan-matrix',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gauss-jordan-matrix.html',
  styleUrls: ['./gauss-jordan-matrix.scss'],
})
export class GaussJordanMatrixComponent {
  @Input() matrixData: MatrixData | null = null;
  @Input() title: string = 'Matriz Aumentada para Gauss-Jordan';

  inverseMatrix: InverseMatrixResponse | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(private regressionService: RegressionService, private cdRef: ChangeDetectorRef) {}

  get augmentedMatrix(): number[][] {
    if (!this.matrixData) return [];

    return [
      [this.matrixData.n, this.matrixData.sumX1, this.matrixData.sumX2, 1, 0, 0],
      [this.matrixData.sumX1, this.matrixData.sumX1Squared, this.matrixData.sumX1x2, 0, 1, 0],
      [this.matrixData.sumX2, this.matrixData.sumX1x2, this.matrixData.sumX2Squared, 0, 0, 1],
    ];
  }

  calculateInverse(): void {
    if (!this.matrixData) return;

    this.isLoading = true;
    this.error = null;

    const matrixData = {
      n: this.matrixData.n,
      sumX1: this.matrixData.sumX1,
      sumX2: this.matrixData.sumX2,
      sumX1Squared: this.matrixData.sumX1Squared,
      sumX2Squared: this.matrixData.sumX2Squared,
      sumX1x2: this.matrixData.sumX1x2,
    };

    console.log('Enviando al backend:', matrixData);

    this.regressionService.calculateInverseMatrix(matrixData).subscribe({
      next: (response) => {
        console.log('Respuesta completa:', response);

        // VERIFICAR que la respuesta tiene el formato correcto
        if (!response || !response.matrix || !response.coefficients) {
          throw new Error('Respuesta inválida del servidor');
        }

        this.inverseMatrix = response;
        this.isLoading = false;
        this.cdRef.detectChanges();
        console.log('Change detection forzado');
      },
      error: (error) => {
        console.error('Error detallado:', error);
        this.error = error.message || 'Error al calcular la matriz inversa';
        this.isLoading = false;
      },
    });
  }

  formatNumber(value: number): string {
    if (value === null || value === undefined) return '0.0';
    // Forzar uso de punto decimal
    const formatted = value.toFixed(0);
    return formatted.replace(',', '.'); // ← Convertir coma a punto
  }

  formatNumberInverseMatrix(value: number): string {
    if (value === null || value === undefined) return '0.0';
    // Forzar uso de punto decimal
    const formatted = value.toFixed(4);
    return formatted.replace(',', '.'); // ← Convertir coma a punto
  }
}
