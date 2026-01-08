import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RelatorioEmpresaPage } from './relatorio-empresa.page';

describe('RelatorioEmpresaPage', () => {
  let component: RelatorioEmpresaPage;
  let fixture: ComponentFixture<RelatorioEmpresaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatorioEmpresaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
