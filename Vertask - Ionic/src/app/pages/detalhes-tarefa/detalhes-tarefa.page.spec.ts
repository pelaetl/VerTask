import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalhesTarefaPage } from './detalhes-tarefa.page';

describe('DetalhesTarefaPage', () => {
  let component: DetalhesTarefaPage;
  let fixture: ComponentFixture<DetalhesTarefaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalhesTarefaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
