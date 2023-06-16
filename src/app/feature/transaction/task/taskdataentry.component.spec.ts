import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TaskDataEntryComponent } from './taskdataentry.component';


describe('Submit Score Component tests', () => {
  let component: TaskDataEntryComponent;
  let fixture: ComponentFixture<TaskDataEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ TaskDataEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskDataEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Task Data Entry component should be created', () => {
    expect(component).toBeTruthy();
  });

  it('Task Data Entry component default message test', () => {
    expect(component.message).toBe('Task Data Entry');
  });
});
