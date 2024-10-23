import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VistaEntrenoComponent } from './vista-entreno.component';

describe('VistaEntrenoComponent', () => {
  let component: VistaEntrenoComponent;
  let fixture: ComponentFixture<VistaEntrenoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [VistaEntrenoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VistaEntrenoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
