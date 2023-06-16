import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RoleMasterComponent } from './rolemaster.component';
import { NgbModal, NgbActiveModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { RoleDeatials, RoleMasterService, RoleMenuDeatials } from '../../../core/services/RoleMasterService';


describe('Role Master Component tests', () => {
  let component: RoleMasterComponent;
  let fixture: ComponentFixture<RoleMasterComponent>;
  let modalService: NgbModal;
  let roleMasterService: RoleMasterService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [RoleMasterComponent],
      providers: [NgbModal, RoleMasterService]
    })
      .compileComponents();
    modalService = TestBed.get(NgbModal);
    roleMasterService = TestBed.get(RoleMasterService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Role Master component should be created', () => {
    expect(component).toBeTruthy();
  });

  it('Role Master component default message test', () => {
    expect(component.message).toBe('Role Master');
  });

  it('Role Master Confirm Close', () => {
    expect(component.confirm("Confirm", "Do you want to change the status of Role City Lead from Active to Inactive ?")).toBe(this.modalService);
  });

});


describe('Role Master Service', () => {
  let roleMasterService: RoleMasterService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    })
      .compileComponents();
      
    roleMasterService = TestBed.get(RoleMasterService);
  }));

  beforeEach(() => {
    roleMasterService = TestBed.get(RoleMasterService);
  });

  it('Role Master Service getRoleDetails', () => {
    debugger;
    let RoleDeatials: RoleDeatials[] = [{ RoleId: 1, RoleName: "City Lead", StatusId: true, UpdatedBy: 'system', UpdatedDate: "1/1/2020", StatusName: "Active" }];
    roleMasterService.getRoleDetails().subscribe(value => {
      expect(value).toBe(RoleDeatials);
    })
  })
});