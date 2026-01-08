import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CadastroAdministradorPage } from './cadastro-administrador.page';

describe('CadastroAdministradorPage', () => {
  let component: CadastroAdministradorPage;
  let fixture: ComponentFixture<CadastroAdministradorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CadastroAdministradorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
