import { HHSClientService } from './hhsclient.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';

@NgModule({
  imports: [CommonModule, HttpModule],
  declarations: [],
  providers: [HHSClientService]
})
export class HhstorageModule {}
