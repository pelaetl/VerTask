import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodasTarefasPage } from './todas-tarefas.page';

describe('TodasTarefasPage', () => {
  let component: TodasTarefasPage;
  let fixture: ComponentFixture<TodasTarefasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TodasTarefasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
