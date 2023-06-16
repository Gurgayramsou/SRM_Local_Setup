import { Component, Input, OnInit, AfterViewInit, Injectable } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'rebar-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {
  @Input() Information:boolean=false;
  @Input() Success:boolean=false;
  @Input() Failure:boolean=false;
  @Input() Warning:boolean=false;
  @Input() message:string = 'Message';
  @Input() title:string = 'Mandatory';
  
  constructor(public activeModal: NgbActiveModal,private modalService:NgbModal)
  {   
  } 
  ngOnInit() {
  }

  DestroyModal(){
    debugger;
    this.modalService.dismissAll();
  }  
  
  public decline() {
    this.activeModal.close(false);
  }

  public accept() {
    this.activeModal.close(true);
  }



}
