import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ToolbarModalesCancelarComponent } from './toolbar-modales-cancelar.component';

describe('ToolbarModalesCancelarComponent', () => {
  let component: ToolbarModalesCancelarComponent;
  let fixture: ComponentFixture<ToolbarModalesCancelarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolbarModalesCancelarComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ToolbarModalesCancelarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
