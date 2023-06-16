import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// containers
import { VendorComponent } from './vendor.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OrderModule } from 'ngx-order-pipe';
// routes
export const ROUTES: Routes = [{ path: '', component: VendorComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(ROUTES), FormsModule,NgbModule, OrderModule],
  declarations: [VendorComponent]
})
export class VendorModule { }
