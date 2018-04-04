/**
 * HHStorage服務設定
 */
export interface IHHStorageConfig {
  /**
   * 服務連結
   */
  host: string;

  /**
   * 帳號
   */
  userId?: string;

  /**
   * 密碼
   */
  password?: string;

  /**
   * 存取權杖
   */
  token?: string;
}
