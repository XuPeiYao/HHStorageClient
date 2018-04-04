import { Observable } from 'rxjs/Observable';
import { HHSClientService } from '../hhsclient.service';
import { IHHSInstance } from './IHHStorageInstance';

/**
 * HHStorage分頁內容
 */
export interface Paging<TSource> extends IHHSInstance {
  /**
   * 起始索引
   */
  skip: number;

  /**
   * 取得筆數
   */
  take: number;

  /**
   * 總筆數
   */
  totalCount: number;

  /**
   * 目前分頁索引
   */
  currentPageIndex: number;

  /**
   * 總分頁數
   */
  totalPageCount: number;

  /**
   * 是否有上一頁
   */
  hasPreviousPage: boolean;

  /**
   * 是否有下一頁
   */
  hasNextPage: boolean;

  /**
   * 分頁結果
   */
  result: TSource[];

  /**
   * 上一頁
   */
  previousPage: () => Observable<Paging<TSource>>;

  /**
   * 下一頁
   */
  nextPage: () => Observable<Paging<TSource>>;
}
