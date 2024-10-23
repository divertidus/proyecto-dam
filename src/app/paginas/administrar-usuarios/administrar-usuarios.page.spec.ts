import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdministrarUsuariosPage } from './administrar-usuarios.page';

describe('AdministrarUsuariosPage', () => {
  let component: AdministrarUsuariosPage;
  let fixture: ComponentFixture<AdministrarUsuariosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrarUsuariosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
