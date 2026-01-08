import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SetorPage } from './setor.page';

describe('SetorPage', () => {
  let component: SetorPage;
  let fixture: ComponentFixture<SetorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SetorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
