import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SubmitScoreComponent } from './submitscore.component';


describe('Submit Score Component tests', () => {
  let component: SubmitScoreComponent;
  let fixture: ComponentFixture<SubmitScoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ SubmitScoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Submit Score component should be created', () => {
    expect(component).toBeTruthy();
  });

  it('Submit Score component default message test', () => {
    expect(component.message).toBe('Submit Score');
  });
});
