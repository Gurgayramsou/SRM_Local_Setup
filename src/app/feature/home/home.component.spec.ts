import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HomeComponent } from './home.component';


describe('Home Component tests', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ HomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Home component should be created', () => {
    expect(component).toBeTruthy();
  });

  it('Home component default message test', () => {
    expect(component.message).toBe('Home Page');
  });

  it('Home component updated message test', () => {
    component.setMessage('new home');
    expect(component.message).toBe('new home');
  });
  it('Home component clear message test', () => {
    component.clearMessage();
    expect(component.message).toBe('');
  });
});
