import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CodigoSenhaPage } from './codigo-senha.page';

describe('CodigoSenhaPage', () => {
  let component: CodigoSenhaPage;
  let fixture: ComponentFixture<CodigoSenhaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CodigoSenhaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
