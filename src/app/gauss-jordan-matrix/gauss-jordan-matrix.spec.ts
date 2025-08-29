import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GaussJordanMatrixComponent } from './gauss-jordan-matrix';

describe('GaussJordanMatrix', () => {
  let component: GaussJordanMatrixComponent;
  let fixture: ComponentFixture<GaussJordanMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GaussJordanMatrixComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GaussJordanMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
