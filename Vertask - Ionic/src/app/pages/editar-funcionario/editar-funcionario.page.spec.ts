import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarFuncionarioPage } from './editar-funcionario.page';

describe('EditarFuncionarioPage', () => {
  let component: EditarFuncionarioPage;
  let fixture: ComponentFixture<EditarFuncionarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarFuncionarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
