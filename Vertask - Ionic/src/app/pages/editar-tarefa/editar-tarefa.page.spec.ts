import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarTarefaPage } from './editar-tarefa.page';

describe('EditarTarefaPage', () => {
  let component: EditarTarefaPage;
  let fixture: ComponentFixture<EditarTarefaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarTarefaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
