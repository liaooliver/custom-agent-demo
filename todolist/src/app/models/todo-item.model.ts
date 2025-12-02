/**
 * Todo Item 介面，代表一個待辦事項的資料結構
 */
export interface TodoItem {
  /** 唯一識別碼 (使用 timestamp 產生) */
  id: string;
  /** 待辦事項標題 */
  title: string;
  /** 建立時間 (timestamp) */
  createdAt: number;
}
