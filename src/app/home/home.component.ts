import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegressionService } from '../service/RegressionService';
import { DataPoint } from '../models/DataPoint.model';
import { MatrixData } from '../models/MatrixData';
import { MatrixDisplayComponent } from '../matrix-display/matrix-display.component';
import { GaussJordanMatrixComponent } from '../gauss-jordan-matrix/gauss-jordan-matrix';
import { RegressionResultsComponent } from '../regresion-resultados-component/regresion-resultados-component';
import { RegressionResult } from '../models/RegressionResult';
import { CorrelationMatrixComponent } from '../correlation-matrix-component/correlation-matrix-component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, MatrixDisplayComponent,
    GaussJordanMatrixComponent,
    RegressionResultsComponent,
    CorrelationMatrixComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  dataPoints: DataPoint[] = [];
  displayedData: DataPoint[] = [];
  summary: any = {};
  isCalculating = false;
  showMatrixComponents = false;
  matrixSingular = false;
  regressionResult: RegressionResult | null = null;
  showResults: boolean = false;

  displayedColumns: string[] = [
    'index', 'y', 'x1', 'x2', 'x1Squared', 'x2Squared', 'x1x2', 'x1y', 'x2y', 'actions',
  ];

  constructor(private regressionService: RegressionService, private router: Router) {}

  ngOnInit(): void {
    this.addEmptyRow();
  }

  // ==================== MÉTODOS AUXILIARES PRIVADOS ====================
  
  // Type Guard para asegurar que los valores no son null
  private isValidDataPoint(point: DataPoint): point is DataPoint & { y: number; x1: number; x2: number } {
    return point.y !== null && point.x1 !== null && point.x2 !== null;
  }

  // Método auxiliar para verificar si todos los valores son iguales
  private allValuesSame<T>(array: T[], accessor: (item: T) => number): boolean {
    if (array.length === 0) return false;
    const firstValue = accessor(array[0]);
    return array.every(item => accessor(item) === firstValue);
  }

  // Método auxiliar para verificar correlación perfecta
  private hasPerfectCorrelation(data: { x1: number; x2: number }[]): boolean {
    if (data.length <= 1) return true;

    const first = data[0];
    
    // Caso especial: si X2 es cero en el primer elemento
    if (first.x2 === 0) {
      return data.every(item => item.x2 === 0 && item.x1 === first.x1);
    }

    const ratio = first.x1 / first.x2;
    
    return data.every(item => {
      // Manejar división por cero
      if (item.x2 === 0) {
        // Si X2 es cero, X1 debe ser cero para mantener proporción (0/0)
        return item.x1 === 0;
      }
      return Math.abs((item.x1 / item.x2) - ratio) < 0.0001;
    });
  }

  // ==================== MÉTODOS PRINCIPALES ====================

  addEmptyRow(): void {
    const newRow: DataPoint = {
      id: Date.now(),
      y: null,
      x1: null,
      x2: null,
    };
    this.dataPoints.push(newRow);
    this.calculateOperations();
  }

  removeRow(index: number): void {
    this.dataPoints.splice(index, 1);
    if (this.dataPoints.length === 0) {
      this.addEmptyRow();
    }
    this.calculateOperations();
  }

  onDataChange(): void {
    this.calculateOperations();
  }

  calculateOperations(): void {
    this.displayedData = this.dataPoints.map((point) =>
      this.regressionService.calculateRowOperations(point)
    );
    this.summary = this.regressionService.calculateSummary(this.displayedData);

    // Verificar singularidad cada vez que cambien los datos
    this.checkForSingularMatrix();
  }

  // MÉTODO PARA DETECTAR MATRIZ SINGULAR
  checkForSingularMatrix(): void {
    // Filtrar usando el type guard
    const validData = this.dataPoints.filter(this.isValidDataPoint);

    if (validData.length < 3) {
      this.matrixSingular = false;
      return;
    }

    // Ahora TypeScript sabe que validData contiene solo números, no nulls
    const allX1Same = this.allValuesSame(validData, item => item.x1);
    const allX2Same = this.allValuesSame(validData, item => item.x2);
    const perfectCorrelation = this.hasPerfectCorrelation(validData);

    this.matrixSingular = allX1Same || allX2Same || perfectCorrelation;
    
    // Opcional: log para debugging
    console.log('Singular matrix check:', {
      allX1Same, allX2Same, perfectCorrelation, matrixSingular: this.matrixSingular
    });
  }

  calculateRegression(): void {
    const validData = this.dataPoints.filter(
      (point) => point.y !== null && point.x1 !== null && point.x2 !== null
    );

    if (validData.length < 3) {
      alert('Se necesitan al menos 3 filas con datos completos para calcular la regresión');
      return;
    }

    // Verificar si la matriz es singular antes de enviar
    if (this.matrixSingular) {
      alert(
        '❌ Error: Los datos tienen multicolinealidad perfecta.\n\n' +
          'Esto significa que:\n' +
          '• Las variables X₁ y X₂ están perfectamente correlacionadas, o\n' +
          '• Una de las variables es constante para todos los datos\n\n' +
          'Por favor, verifica los datos.'
      );
      return;
    }

    this.isCalculating = true;
    this.showMatrixComponents = true;

    this.regressionService.calculateRegression(validData).subscribe({
      next: (result) => {
        this.isCalculating = false;
        this.regressionResult = result;
        this.showResults = true;
        console.log('Resultado:', result);
        alert('✅ Regresión calculada exitosamente');
      },
      error: (error) => {
        this.isCalculating = false;
        this.showResults = false;
        console.error('Error:', error);

        // Manejar error de matriz singular del backend
        if (error.error && error.error.includes('singular')) {
          alert(
            '❌ Error del servidor: Matriz singular.\n\n' +
              'El sistema no puede resolverse porque los datos tienen multicolinealidad.'
          );
        } else {
          alert('Error al calcular la regresión: ' + (error.error || error.message));
        }
      },
    });
  }

  clearAll(): void {
    this.dataPoints = [];
    this.displayedData = [];
    this.summary = {};
    this.showMatrixComponents = false;
    this.matrixSingular = false;
    this.regressionResult = null;
    this.showResults = false;
    this.addEmptyRow();
  }

  trackByFn(index: number, item: DataPoint): number {
    return item.id;
  }

  get matrixData(): MatrixData | null {
    if (this.summary.count < 3) return null;

    return {
      n: this.summary.count,
      sumX1: this.summary.sumX1,
      sumX2: this.summary.sumX2,
      sumY: this.summary.sumY,
      sumX1Squared: this.summary.sumX1Squared,
      sumX2Squared: this.summary.sumX2Squared,
      sumX1x2: this.summary.sumX1x2,
      sumX1y: this.summary.sumX1y,
      sumX2y: this.summary.sumX2y,
    };
  }
}