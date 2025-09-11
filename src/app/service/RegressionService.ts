import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataPoint } from '../models/DataPoint.model';
import { InverseMatrixRequest } from '../models/InverseMatrixRequest.model';
import { InverseMatrixResponse } from '../models/InverseMatrixResponse.model';
import { RegressionResult } from '../models/RegressionResult';

@Injectable({
  providedIn: 'root',
})
export class RegressionService {
  //private apiUrl = 'http://localhost:8080/api/regression';
  private apiUrl = 'https://regresi-n-lineal-multiple.onrender.com/api/regression';

  constructor(private http: HttpClient) {}

  calculateRegression(data: DataPoint[]): Observable<RegressionResult> {
    const validData = data.filter(
      (point) => point.y !== null && point.x1 !== null && point.x2 !== null
    );

    return this.http.post<RegressionResult>(`${this.apiUrl}/calculate`, {
      data: validData,
    });
  }

  // regression.service.ts - FALTA esto:
  calculateInverseMatrix(data: InverseMatrixRequest): Observable<InverseMatrixResponse> {
    return this.http.post<InverseMatrixResponse>(`${this.apiUrl}/inverse`, data);
  }
  // Calcular operaciones para cada fila
  calculateRowOperations(point: DataPoint): DataPoint {
    return {
      ...point,
      x1Squared: point.x1 !== null ? point.x1 * point.x1 : null,
      x2Squared: point.x2 !== null ? point.x2 * point.x2 : null,
      x1x2: point.x1 !== null && point.x2 !== null ? point.x1 * point.x2 : null,
      x1y: point.x1 !== null && point.y !== null ? point.x1 * point.y : null,
      x2y: point.x2 !== null && point.y !== null ? point.x2 * point.y : null,
    };
  }

  // Calcular sumatorias
  calculateSummary(data: DataPoint[]): any {
    const validData = data.filter(
      (point) => point.y !== null && point.x1 !== null && point.x2 !== null
    );

    return {
      sumY: validData.reduce((sum, point) => sum + (point.y || 0), 0),
      sumX1: validData.reduce((sum, point) => sum + (point.x1 || 0), 0),
      sumX2: validData.reduce((sum, point) => sum + (point.x2 || 0), 0),
      sumX1Squared: validData.reduce((sum, point) => sum + (point.x1Squared || 0), 0),
      sumX2Squared: validData.reduce((sum, point) => sum + (point.x2Squared || 0), 0),
      sumX1x2: validData.reduce((sum, point) => sum + (point.x1x2 || 0), 0),
      sumX1y: validData.reduce((sum, point) => sum + (point.x1y || 0), 0),
      sumX2y: validData.reduce((sum, point) => sum + (point.x2y || 0), 0),
      count: validData.length,
    };
  }
}
