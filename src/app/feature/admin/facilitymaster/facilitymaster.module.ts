import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'; 
// containers
import { FacilityMasterComponent } from '../facilitymaster/facilitymaster.component';
//import { NumberDirective } from '../../../shared/directive/numbers.directive';
// import { NgbModal,NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';

// routes
export const ROUTES: Routes = [{ path: '', component: FacilityMasterComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(ROUTES), FormsModule, ReactiveFormsModule, NgbModule],
  declarations: [FacilityMasterComponent],//, NumberDirective],
})
export class FacilityMasterModule { }

