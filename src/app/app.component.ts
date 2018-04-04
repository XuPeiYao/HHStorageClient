import { concat } from 'rxjs/operators';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { HHSClientService } from './hhstorage/hhsclient.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private client: HHSClientService) {}
  title = 'app';

  @ViewChild('inputElement') inputElement: ElementRef;

  async getStorageList() {
    await this.client.login().toPromise();
    const storage = (await this.client.getStorageList(0, 1).toPromise())
      .result[0];

    storage
      .upload((this.inputElement.nativeElement as HTMLInputElement).files[0])
      .subscribe(ok => {
        console.log(ok);
        ok.getMD5().subscribe(console.log);
        console.log(ok.getDownloadUrl());
      });
    /*
    this.client.getStorageList(0, 1).subscribe(x => {
      console.log(x);
      this.client.getStorage(x.result[0].id).subscribe(console.log);

      // 下一頁
      x.nextPage().subscribe(y => {
        y.result[0].name = 'hahaha';
        y.result[0].update().subscribe(console.log);
      });

      // 上一頁
      // x.previousPage().subscribe(console.log);
    });*/
  }
}
