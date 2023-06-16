import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// containers
import { TaskMasterComponent } from './taskmaster.component';
import { DecimalDirective } from '../../../shared/directive/decimals.directive';
import {AlphaNumericDirective} from '../../../shared/directive/alphanumeric.directive';
import {TaskInputDirective} from '../../../shared/directive/taskinput.directive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OrderModule } from 'ngx-order-pipe';

// routes
export const ROUTES: Routes = [{ path: '', component: TaskMasterComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(ROUTES), FormsModule,NgbModule, OrderModule],
  declarations: [TaskMasterComponent, DecimalDirective,AlphaNumericDirective,TaskInputDirective]
})
export class TaskMasterModule { }
