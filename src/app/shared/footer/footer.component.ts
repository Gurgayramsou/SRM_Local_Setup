import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as $ from 'jquery';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'rebar-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, AfterViewInit {

  constructor(private modalService: NgbModal) { }
  CurrentYear: number;
  enableShow: boolean = true;
  ModalPopUpHeader:string="Terms Of Use";
  showHideButtonName: string= "Hide";
  ngOnInit() {
    this.CurrentYear = (new Date()).getFullYear();
  }
  showHideFooter(): void {
    //debugger;
    this.enableShow = !this.enableShow;
    this.showHideButtonName = this.showHideButtonName == "Hide" ? "Show" : "Hide";
  }
  AddTermsOfUse(TermsModal)   {
    this.ModalPopUpHeader = "Terms Of Use";
    this.modalService.open(TermsModal, { backdrop: 'static', keyboard: false, windowClass: "edit" });
    }
    cancelbtn(){
      this.modalService.dismissAll(); 
    } 
  ngAfterViewInit() {
  }

}
