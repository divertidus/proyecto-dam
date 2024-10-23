import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HistorialEntrenamientoComponent } from './historial-entrenamiento.component';

describe('HistorialEntrenamientoComponent', () => {
  let component: HistorialEntrenamientoComponent;
  let fixture: ComponentFixture<HistorialEntrenamientoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HistorialEntrenamientoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialEntrenamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
