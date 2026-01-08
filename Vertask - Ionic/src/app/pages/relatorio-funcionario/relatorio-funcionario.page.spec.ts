import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RelatorioFuncionarioPage } from './relatorio-funcionario.page';

describe('RelatorioFuncionarioPage', () => {
  let component: RelatorioFuncionarioPage;
  let fixture: ComponentFixture<RelatorioFuncionarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatorioFuncionarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
