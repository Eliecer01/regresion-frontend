import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegressionResult } from '../models/RegressionResult';

@Component({
  selector: 'app-correlation-matrix',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './correlation-matrix-component.html',
  styleUrls: ['./correlation-matrix-component.scss'],
})
export class CorrelationMatrixComponent implements OnInit {
  @Input() regressionData: RegressionResult | null = null;

  multipleCorrelation: number = 0;
  correlationStrength: string = '';

  ngOnInit(): void {
    this.calculateMultipleCorrelation();
  }

  ngOnChanges(): void {
    this.calculateMultipleCorrelation();
  }

  private calculateMultipleCorrelation(): void {
    console.log('Regression data:', this.regressionData);

    if (
      this.regressionData &&
      this.regressionData.rsquared !== null &&
      this.regressionData.rsquared !== undefined
    ) {
      console.log('R² value:', this.regressionData.rsquared);

      if (!isNaN(this.regressionData.rsquared) && this.regressionData.rsquared >= 0) {
        this.multipleCorrelation = Math.sqrt(this.regressionData.rsquared);
        this.correlationStrength = this.getCorrelationStrength(this.multipleCorrelation);
        console.log('Multiple correlation calculated:', this.multipleCorrelation);
      } else {
        console.warn('Invalid R² value:', this.regressionData.rsquared);
        this.multipleCorrelation = 0;
        this.correlationStrength = 'no calculable';
      }
    } else {
      console.warn('No regression data or R² is null/undefined');
      this.multipleCorrelation = 0;
      this.correlationStrength = 'no calculable';
    }
  }

  getCorrelationStrength(value: number): string {
    if (value >= 0.9) return 'MUY FUERTE';
    if (value >= 0.7) return 'FUERTE';
    if (value >= 0.5) return 'MODERADA';
    if (value >= 0.3) return 'DÉBIL';
    return 'MUY DÉBIL';
  }

  getCorrelationColor(value: number): string {
    if (value >= 0.7) return '#4caf50'; // Verde para correlaciones fuertes
    if (value >= 0.5) return '#ff9800'; // Naranja para moderadas
    if (value >= 0.3) return '#ffeb3b'; // Amarillo para débiles
    return '#f44336'; // Rojo para muy débiles
  }
}
