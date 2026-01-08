import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InicioFuncionarioPage } from './inicio-funcionario.page';

describe('InicioFuncionarioPage', () => {
  let component: InicioFuncionarioPage;
  let fixture: ComponentFixture<InicioFuncionarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InicioFuncionarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
