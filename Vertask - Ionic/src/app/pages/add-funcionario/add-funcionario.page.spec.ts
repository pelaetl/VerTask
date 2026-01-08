import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddFuncionarioPage } from './add-funcionario.page';

describe('AddFuncionarioPage', () => {
  let component: AddFuncionarioPage;
  let fixture: ComponentFixture<AddFuncionarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFuncionarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
