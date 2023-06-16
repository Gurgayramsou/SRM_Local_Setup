import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// containers
import { PerformanceDashboardComponent } from './perforamancedashboard.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// routes
export const ROUTES: Routes = [{ path: '', component: PerformanceDashboardComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(ROUTES), FormsModule, NgbModule],
  declarations: [PerformanceDashboardComponent]
})
export class PerformanceDashboardModule { }
