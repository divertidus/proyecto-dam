import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PopoverUsuarioAvatarComponent } from './popover-usuario-avatar.component';

describe('PopoverUsuarioAvatarComponent', () => {
  let component: PopoverUsuarioAvatarComponent;
  let fixture: ComponentFixture<PopoverUsuarioAvatarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PopoverUsuarioAvatarComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PopoverUsuarioAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
