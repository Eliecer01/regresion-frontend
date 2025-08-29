import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataPoint } from '../models/DataPoint.model';
import { RegressionResult } from '../models/RegressionResult';

@Component({
  selector: 'app-regression-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './regresion-resultados-component.html',
  styleUrls: ['./regresion-resultados-component.scss']
})
export class RegressionResultsComponent {
  @Input() dataPoints: DataPoint[] = [];
  @Input() regressionData: RegressionResult | null = null;

  get validDataPoints(): DataPoint[] {
    return this.dataPoints.filter(point => 
      point.y !== null && point.x1 !== null && point.x2 !== null
    );
  }

  get validDataCount(): number {
    return this.validDataPoints.length;
  }

  calculatePrediction(point: DataPoint): number {
    if (!this.regressionData?.coefficients || 
        point.x1 === null || point.x2 === null) {
      return 0;
    }

    const [intercept, coefX1, coefX2] = this.regressionData.coefficients;
    return intercept + coefX1 * point.x1 + coefX2 * point.x2;
  }

  calculateError(point: DataPoint): number {
    if (point.y === null) return 0;
    return point.y - this.calculatePrediction(point);
  }

  calculateSquaredError(point: DataPoint): number {
    const error = this.calculateError(point);
    return error * error;
  }

  calculateTotalSCE(): number {
    return this.validDataPoints.reduce((sum, point) => {
      return sum + this.calculateSquaredError(point);
    }, 0);
  }

  calculateYMean(): number {
    const validY = this.validDataPoints.map(point => point.y as number);
    if (validY.length === 0) return 0;
    
    return validY.reduce((sum, y) => sum + y, 0) / validY.length;
  }

  calculateRegressionSum(point: DataPoint): number {
    const prediction = this.calculatePrediction(point);
    const yMean = this.calculateYMean();
    return (prediction - yMean) * (prediction - yMean);
  }

  calculateTotalSCR(): number {
    return this.validDataPoints.reduce((sum, point) => {
      return sum + this.calculateRegressionSum(point);
    }, 0);
  }

  calculateTotalSST(): number {
    const scr = this.calculateTotalSCR();
    const sce = this.calculateTotalSCE();
    return scr + sce;
  }

  calculateRSquared(): number {
    const scr = this.calculateTotalSCR();
    const sst = this.calculateTotalSST();
    
    if (sst === 0) return 0;
    
    return scr / sst;
  }

  calculateAdjustedRSquared(): number {
    const rSquared = this.calculateRSquared();
    const n = this.validDataCount;
    const k = 2; // Número de variables independientes (X₁ y X₂)
    
    if (n <= k + 1) return 0; // Evitar división por cero
    
    return 1 - (1 - rSquared) * ((n - 1) / (n - k - 1));
  }

  calculateStandardError(): number {
    const sce = this.calculateTotalSCE();
    const n = this.validDataCount;
    
    if (n <= 3) return 0;
    
    return Math.sqrt(sce / (n - 3));
  }
}