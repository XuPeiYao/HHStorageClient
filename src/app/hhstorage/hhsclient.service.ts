import { AccessModifier } from './models/AccessModifier';
import { Injectable, InjectionToken, Inject } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { IHHStorageConfig } from './hhstorageConfig';
import { Observable } from 'rxjs/Observable';
import { filter, map, reduce, concat } from 'rxjs/operators';
import { Paging } from './models/Paging';
import { UriBuilder, UriQueryBuilder } from 'uribuilder';
import 'rxjs/add/observable/empty';
import { HHSStorage } from './models/Storage';
import { HHSFile } from './models/File';

export const HHS_Config = new InjectionToken('HHStorageClient_Config');

/**
 * HHStorage客戶端
 */
@Injectable()
export class HHSClientService {
  /**
   * 存取權杖
   */
  token: string;

  /**
   * HHStorage客戶端建構子
   * @param http HTTPClient實例
   * @param config HHStorage服務設定
   */
  constructor(
    private http: Http,
    @Inject(HHS_Config) private config: IHHStorageConfig
  ) {
    if (config.token) {
      this.token = config.token;
    }
  }

  /**
   * 登入服務
   */
  public login(): Observable<void> {
    if (this.token) {
      Observable.empty();
    }
    return this.http
      .post(this.makeUrl('api/user/token'), {
        id: this.config.userId,
        password: this.config.password
      })
      .pipe(
        map(value => (value.ok ? value.json() : null)),
        map(value => {
          if (!value) {
            Observable.throw('登入失敗');
            return;
          }
          this.token = value;
        })
      );
  }

  // #region Storage
  /**
   * 取得儲存庫列表分頁結果
   * @param skip 起始索引
   * @param take 取得筆數
   */
  public getStorageList(
    skip: number = 0,
    take: number = 10
  ): Observable<Paging<HHSStorage>> {
    let apiUrl = this.makeUrl('api/Storage');
    apiUrl = UriBuilder.updateQuery(apiUrl, {
      skip: skip,
      take: take
    });

    const nextPage = function(): Observable<Paging<HHSStorage>> {
      if (!this.hasNextPage) {
        return null;
      }

      return this.client.getStorageList(this.skip + this.take, this.take);
    };

    const previousPage = function(): Observable<Paging<HHSStorage>> {
      if (!this.hasPreviousPage) {
        return null;
      }
      return this.client.getStorageList(this.skip - this.take, this.take);
    };

    return this.http.get(apiUrl, this.getRequestOptions()).pipe(
      map(value => {
        const result = <Paging<HHSStorage>>value.json();
        result.client = this;
        result.nextPage = nextPage;
        result.previousPage = previousPage;
        nextPage.bind(result);
        previousPage.bind(result);

        for (const item of result.result) {
          this.bindStorageMethod(item);
        }

        return result;
      })
    );
  }

  /**
   * 取得指定儲存庫
   * @param id 唯一識別號
   */
  public getStorage(id: string): Observable<HHSStorage> {
    return this.http
      .get(this.makeUrl('api/Storage/') + id, this.getRequestOptions())
      .pipe(
        map(value => {
          const result: HHSStorage = <HHSStorage>value.json();

          this.bindStorageMethod(result);

          return result;
        })
      );
  }

  /**
   * 建立儲存庫
   * @param name 名稱
   * @param accessModifier 存取限制
   */
  public createStorage(
    name: string,
    accessModifier: AccessModifier = 'Public'
  ): Observable<HHSStorage> {
    return this.http
      .post(
        this.makeUrl('api/Storage/'),
        { name: name, accessModifier: accessModifier },
        this.getRequestOptions()
      )
      .pipe(
        map(value => {
          const result: HHSStorage = <HHSStorage>value.json();

          this.bindStorageMethod(result);

          return result;
        })
      );
  }

  /**
   * 更新儲存體
   * @param stroage 儲存體實例
   */
  public updateStorage(stroage: HHSStorage): Observable<HHSStorage> {
    return this.http
      .put(this.makeUrl('api/Storage/'), stroage, this.getRequestOptions())
      .pipe(
        map(value => {
          stroage = <HHSStorage>value.json();

          this.bindStorageMethod(stroage);

          return stroage;
        })
      );
  }

  /**
   * 刪除儲存體
   * @param Storage 儲存體實例或唯一識別號
   */
  public deleteStorage(storage: HHSStorage | string): Observable<void> {
    let storageId = storage;
    if (!(storageId instanceof String || typeof storageId === 'string')) {
      storageId = (storageId as any).Id;
    }

    return this.http
      .delete(
        this.makeUrl('api/Storage/') + storageId,
        this.getRequestOptions()
      )
      .pipe(map(x => null));
  }

  // #endregion

  // #region File
  public getFileList(
    skip: number = 0,
    take: number = 10
  ): Observable<Paging<HHSFile>> {
    let apiUrl = this.makeUrl('api/File');
    apiUrl = UriBuilder.updateQuery(apiUrl, {
      skip: skip,
      take: take
    });

    const nextPage = function(): Observable<Paging<HHSFile>> {
      if (!this.hasNextPage) {
        return null;
      }

      return this.client.getFileList(this.skip + this.take, this.take);
    };

    const previousPage = function(): Observable<Paging<HHSFile>> {
      if (!this.hasPreviousPage) {
        return null;
      }
      return this.client.getFileList(this.skip - this.take, this.take);
    };

    return this.http.get(apiUrl, this.getRequestOptions()).pipe(
      map(value => {
        const result = <Paging<HHSFile>>value.json();
        result.client = this;
        result.nextPage = nextPage;
        result.previousPage = previousPage;
        nextPage.bind(result);
        previousPage.bind(result);

        for (const item of result.result) {
          this.bindFileMethod(item);
        }

        return result;
      })
    );
  }

  /**
   * 取得指定檔案
   * @param id 檔案唯一識別號
   */
  public getFile(id: string): Observable<HHSFile> {
    return this.http
      .get(this.makeUrl('api/File/') + id, this.getRequestOptions())
      .pipe(
        map(value => {
          const result: HHSFile = <HHSFile>value.json();

          this.bindFileMethod(result);

          return result;
        })
      );
  }

  public upload(
    storage: HHSStorage | string,
    file: File,
    accessModifier: AccessModifier = 'Public'
  ) {
    let storageId = storage;
    if (!(storageId instanceof String || typeof storageId === 'string')) {
      storageId = (storageId as any).id;
    }

    const formData = new FormData();
    formData.append('storageId', <string>storageId);
    formData.append('file', file);
    formData.append('accessModifier', accessModifier);

    return this.http
      .post(this.makeUrl('api/File/'), formData, this.getRequestOptions())
      .pipe(
        map(value => {
          const result: HHSFile = <HHSFile>value.json();

          this.bindFileMethod(result);

          return result;
        })
      );
  }

  public uploadByToken(
    token: string,
    file: File,
    accessModifier: AccessModifier = 'Public'
  ): Observable<HHSFile> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('accessModifier', accessModifier);

    const query = new UriQueryBuilder({
      token: token
    }).toString();

    return this.http.post(this.makeUrl('api/File/' + query), formData).pipe(
      map(value => {
        const result: HHSFile = <HHSFile>value.json();

        this.bindFileMethod(result);

        return result;
      })
    );
  }

  public append(
    fileInstance: HHSFile | string,
    file: File
  ): Observable<HHSFile> {
    let fileInstanceId = fileInstance;
    if (
      !(fileInstanceId instanceof String || typeof fileInstanceId === 'string')
    ) {
      fileInstanceId = (fileInstanceId as any).id;
    }

    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post(
        this.makeUrl('api/File/' + fileInstanceId + '/append'),
        formData,
        this.getRequestOptions()
      )
      .pipe(
        map(value => {
          const result: HHSFile = <HHSFile>value.json();

          this.bindFileMethod(result);

          return result;
        })
      );
  }

  public appendByToken(
    token: string,
    fileInstance: HHSFile | string,
    file: File
  ): Observable<HHSFile> {
    let fileInstanceId = fileInstance;
    if (
      !(fileInstanceId instanceof String || typeof fileInstanceId === 'string')
    ) {
      fileInstanceId = (fileInstanceId as any).id;
    }

    const formData = new FormData();
    formData.append('file', file);

    const query = new UriQueryBuilder({ token: token }).toString();

    return this.http
      .post(
        this.makeUrl('api/File/' + fileInstanceId + '/append' + query),
        formData
      )
      .pipe(
        map(value => {
          const result: HHSFile = <HHSFile>value.json();

          this.bindFileMethod(result);

          return result;
        })
      );
  }

  public updateFile(file: HHSFile): Observable<HHSFile> {
    return this.http
      .put(this.makeUrl('api/File/'), file, this.getRequestOptions())
      .pipe(
        map(value => {
          file = <HHSFile>value.json();

          this.bindFileMethod(file);

          return file;
        })
      );
  }

  public getFileMD5(file: HHSFile | string): Observable<string> {
    let fileId = file;
    if (!(fileId instanceof String || typeof fileId === 'string')) {
      fileId = (fileId as any).id;
    }

    return this.http
      .get(
        this.makeUrl('api/File/') + fileId + '/md5',
        this.getRequestOptions()
      )
      .pipe(map(value => value.json()));
  }

  public getFileDownloadUrl(file: HHSFile | string, token?: string): string {
    let fileId = file;
    if (!(fileId instanceof String || typeof fileId === 'string')) {
      fileId = (fileId as any).id;
    }
    if (token) {
      return this.makeUrl(
        'api/File/' +
          fileId +
          '/download' +
          new UriQueryBuilder({ token: token }).toString()
      );
    } else {
      return this.makeUrl('api/File/' + fileId + '/download');
    }
  }

  public deleteFile(file: HHSFile | string): Observable<void> {
    let fileId = file;
    if (!(fileId instanceof String || typeof fileId === 'string')) {
      fileId = (fileId as any).id;
    }

    return this.http
      .delete(this.makeUrl('api/File/') + fileId, this.getRequestOptions())
      .pipe(map(x => null));
  }
  // #endregion

  // #region 內部
  private makeUrl(path: string): string {
    return this.config.host + '/' + path;
  }

  private getRequestOptions(): any {
    return {
      headers: new Headers({
        Authorization: this.token
      })
    };
  }

  private bindStorageMethod(storage: HHSStorage) {
    storage.client = this;
    storage.update = function(): Observable<void> {
      return (this.client as HHSClientService)
        .updateStorage(this)
        .pipe(map(value => null));
    };

    storage.upload = function(
      file: File,
      accessModifier: AccessModifier = 'Public'
    ): Observable<HHSFile> {
      return (this.client as HHSClientService).upload(
        this,
        file,
        accessModifier
      );
    };

    storage.update.bind(storage);
  }

  private bindFileMethod(fileInstance: HHSFile) {
    fileInstance.client = this;
    fileInstance.update = function(): Observable<void> {
      return (this.client as HHSClientService)
        .updateFile(this)
        .pipe(map(x => null));
    };

    fileInstance.append = function(file: File): Observable<void> {
      return (this.client as HHSClientService).append(this, file).pipe(
        map(value => {
          this.size = value.size;
          return null;
        })
      );
    };

    fileInstance.appendByToken = function(
      token: string,
      file: File
    ): Observable<void> {
      return (this.client as HHSClientService)
        .appendByToken(token, this, file)
        .pipe(
          map(value => {
            this.size = value.size;
            return null;
          })
        );
    };

    fileInstance.getStorage = function(): Observable<HHSStorage> {
      return (this.client as HHSClientService).getStorage(this.storageId);
    };

    fileInstance.getMD5 = function(): Observable<string> {
      return (this.client as HHSClientService).getFileMD5(this);
    };

    fileInstance.getDownloadUrl = function(token?: string): string {
      return (this.client as HHSClientService).getFileDownloadUrl(this, token);
    };

    fileInstance.update.bind(fileInstance);
    fileInstance.append.bind(fileInstance);
    fileInstance.appendByToken.bind(fileInstance);
    fileInstance.getStorage.bind(fileInstance);
    fileInstance.getMD5.bind(fileInstance);
    fileInstance.getDownloadUrl.bind(fileInstance);
  }
  // #endregion
}
