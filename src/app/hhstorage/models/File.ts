import { AccessModifier } from './AccessModifier';
import { IHHSInstance } from './IHHStorageInstance';
import { Observable } from 'rxjs/Observable';
import { HHSStorage } from './Storage';

// tslint:disable-next-line:no-empty-interface
export interface HHSFile extends IHHSInstance {
  id: string;
  contentType: string;
  name: string;
  size: number;
  storageId: string;
  accessModifier: AccessModifier;

  update(): Observable<void>;

  append(file: File | Blob): Observable<void>;
  appendByToken(token: string, file: File | Blob): Observable<void>;
  getStorage(): Observable<HHSStorage>;
  getMD5(): Observable<string>;
  getDownloadUrl(token?: string): string;
}
