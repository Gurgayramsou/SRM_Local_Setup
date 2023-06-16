import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// containers
import { TaskDataEntryComponent } from './taskdataentry.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// routes
export const ROUTES: Routes = [{ path: '', component: TaskDataEntryComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(ROUTES), FormsModule, NgbModule],
  declarations: [TaskDataEntryComponent]
})
export class TaskDataEntryModule { }
