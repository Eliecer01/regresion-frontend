import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrelationMatrixComponent } from './correlation-matrix-component';

describe('CorrelationMatrixComponent', () => {
  let component: CorrelationMatrixComponent;
  let fixture: ComponentFixture<CorrelationMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorrelationMatrixComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorrelationMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
