import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// containers
import { RoleMappingComponent } from '../rolemapping/rolemapping.component';
//import { NumberDirective } from '../../../shared/directive/numbers.directive';
// import { NgbModal,NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';

// routes
export const ROUTES: Routes = [{ path: '', component: RoleMappingComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(ROUTES), FormsModule, ReactiveFormsModule, NgbModule],
  declarations: [RoleMappingComponent],//, NumberDirective],
})
export class RoleMappingModule { }

