import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegressionResultsComponent } from './regresion-resultados-component';

describe('RegresionResultadosComponent', () => {
  let component: RegressionResultsComponent;
  let fixture: ComponentFixture<RegressionResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegressionResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegressionResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
