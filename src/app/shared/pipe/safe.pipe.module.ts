import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// containers
import { SafePipe } from './safe.pipe';


@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [SafePipe],
  exports: [SafePipe]
})
export class SafePipeModule { }
