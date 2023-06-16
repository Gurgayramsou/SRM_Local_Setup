import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// containers
import { CreatePackageComponent } from './createpackage.component';
import { NumberDirective } from '../../../shared/directive/numbers.directive';
import { DecimalDirective1 } from '../../../shared/directive/decimals1.directive';
import {SpecialCharacterDirective} from '../../../shared/directive/specialcharacter.directive'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { NgbModal,NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';

// routes
export const ROUTES: Routes = [{ path: '', component: CreatePackageComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(ROUTES), FormsModule, ReactiveFormsModule,NgbModule],
  declarations: [CreatePackageComponent, NumberDirective,SpecialCharacterDirective,DecimalDirective1],
})
export class CreatePackageModule { }

