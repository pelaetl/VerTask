import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TarefaFuncionarioPage } from './tarefa-funcionario.page';

describe('TarefaFuncionarioPage', () => {
  let component: TarefaFuncionarioPage;
  let fixture: ComponentFixture<TarefaFuncionarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TarefaFuncionarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
