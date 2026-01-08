import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SetoresPage } from './setores.page';

describe('SetoresPage', () => {
  let component: SetoresPage;
  let fixture: ComponentFixture<SetoresPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SetoresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
