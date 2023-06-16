import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RoleMasterComponent } from '../rolemaster/rolemaster.component';

export const ROUTES: Routes = [{ path: '', component: RoleMasterComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(ROUTES), FormsModule, ReactiveFormsModule, NgbModule],
  declarations: [RoleMasterComponent],
})
export class RoleMasterModule { }

