import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TarefaEmpresaPage } from './tarefa-empresa.page';

describe('TarefaEmpresaPage', () => {
  let component: TarefaEmpresaPage;
  let fixture: ComponentFixture<TarefaEmpresaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TarefaEmpresaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
