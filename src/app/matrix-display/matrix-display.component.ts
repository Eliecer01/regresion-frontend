import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatrixData } from '../models/MatrixData';

@Component({
  selector: 'app-matrix-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './matrix-display.component.html',
  styleUrls: ['./matrix-display.component.scss']
})
export class MatrixDisplayComponent {
  @Input() matrixData: MatrixData | null = null;
  @Input() title: string = 'Matriz de Ecuaciones Normales';

  get matrixA(): number[][] {
    if (!this.matrixData) return [];
    
    return [
      [this.matrixData.n, this.matrixData.sumX1, this.matrixData.sumX2],
      [this.matrixData.sumX1, this.matrixData.sumX1Squared, this.matrixData.sumX1x2],
      [this.matrixData.sumX2, this.matrixData.sumX1x2, this.matrixData.sumX2Squared]
    ];
  }

  get vectorB(): number[] {
    if (!this.matrixData) return [];
    
    return [
      this.matrixData.sumY,
      this.matrixData.sumX1y,
      this.matrixData.sumX2y
    ];
  }

  get coefficients(): string[] {
    return ['a', 'b₁', 'b₂'];
  }
}