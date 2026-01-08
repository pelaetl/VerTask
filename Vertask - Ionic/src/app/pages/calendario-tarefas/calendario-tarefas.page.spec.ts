import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarioTarefasPage } from './calendario-tarefas.page';

describe('CalendarioTarefasPage', () => {
  let component: CalendarioTarefasPage;
  let fixture: ComponentFixture<CalendarioTarefasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarioTarefasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
