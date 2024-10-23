import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EjercicioEntrenamientoDiaCardComponent } from './ejercicio-entrenamiento-dia-card.component';

describe('EjercicioEntrenamientoDiaCardComponent', () => {
  let component: EjercicioEntrenamientoDiaCardComponent;
  let fixture: ComponentFixture<EjercicioEntrenamientoDiaCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EjercicioEntrenamientoDiaCardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EjercicioEntrenamientoDiaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
