import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InicioAdministradorPage } from './inicio-administrador.page';

describe('InicioAdministradorPage', () => {
  let component: InicioAdministradorPage;
  let fixture: ComponentFixture<InicioAdministradorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InicioAdministradorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
