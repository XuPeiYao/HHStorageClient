import { AccessModifier } from './AccessModifier';
import { HHSClientService } from '../hhsclient.service';
import { IHHSInstance } from './IHHStorageInstance';
import { Observable } from 'rxjs/Observable';
import { HHSFile } from './File';
export interface HHSStorage extends IHHSInstance {
  id: string;
  name: string;
  userId: string;
  accessModifier: AccessModifier;

  update: () => Observable<void>;
  upload: (file: File, accessModifier?: AccessModifier) => Observable<HHSFile>;
  uploadWithResume: (
    file: File,
    accessModifier?: AccessModifier
  ) => Observable<HHSFile>;

  getFileList: (skip: number, take: number) => Observable<HHSFile>;
}
