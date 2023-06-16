import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// containers
import { HomeComponent } from './home.component';

// routes
export const ROUTES: Routes = [{ path: '', component: HomeComponent }];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  declarations: [HomeComponent],
  schemas: [
    NO_ERRORS_SCHEMA
  ]
})
export class HomeModule {}
