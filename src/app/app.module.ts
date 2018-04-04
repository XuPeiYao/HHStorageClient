import { IHHStorageConfig } from './hhstorage/hhstorageConfig';
import { HhstorageModule } from './hhstorage/hhstorage.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HHS_Config } from './hhstorage/hhsclient.service';

const hhsConfig: IHHStorageConfig = {
  host: 'http://localhost:58683', //'http://storage.gofa.cloud',
  userId: 'admin',
  password: 'admin'
};

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HhstorageModule],
  providers: [
    {
      provide: HHS_Config,
      useValue: hhsConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
