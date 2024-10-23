import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DiaEntrenamientoCardComponent } from './dia-entrenamiento-card.component';

describe('DiaEntrenamientoCardComponent', () => {
  let component: DiaEntrenamientoCardComponent;
  let fixture: ComponentFixture<DiaEntrenamientoCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DiaEntrenamientoCardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DiaEntrenamientoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
