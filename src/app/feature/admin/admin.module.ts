import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// containers
import { AdminComponent } from './admin.component';

// routes
export const ROUTES: Routes = [{ path: '', component: AdminComponent }];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  declarations: [AdminComponent],
  schemas: [
    NO_ERRORS_SCHEMA
  ]
})
export class AdminModule {}
