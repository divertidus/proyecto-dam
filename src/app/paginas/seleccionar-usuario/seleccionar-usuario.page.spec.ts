import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeleccionarUsuarioPage } from './seleccionar-usuario.page';

describe('SeleccionarUsuarioPage', () => {
  let component: SeleccionarUsuarioPage;
  let fixture: ComponentFixture<SeleccionarUsuarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SeleccionarUsuarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
