import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddSetorPage } from './add-setor.page';

describe('AddSetorPage', () => {
  let component: AddSetorPage;
  let fixture: ComponentFixture<AddSetorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSetorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
