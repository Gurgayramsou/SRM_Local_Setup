import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// containers
import { SubmitScoreComponent } from './submitscore.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {DisableKeyboardKeyDirective} from '../../../shared/directive/disableKeyboardKey.directive';

// routes
export const ROUTES: Routes = [{ path: '', component: SubmitScoreComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(ROUTES), FormsModule, NgbModule],
  declarations: [SubmitScoreComponent, DisableKeyboardKeyDirective]
})
export class SubmitScoreModule { }
