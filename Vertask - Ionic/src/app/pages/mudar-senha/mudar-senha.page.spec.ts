import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MudarSenhaPage } from './mudar-senha.page';

describe('MudarSenhaPage', () => {
  let component: MudarSenhaPage;
  let fixture: ComponentFixture<MudarSenhaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MudarSenhaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
