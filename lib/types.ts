/**
 * Notion API 型別定義
 * 使用 any 型別與 Notion SDK 相容,實際驗證在業務邏輯層進行
 */

/**
 * 日誌資料庫的 properties 結構
 */
export interface NotionLogProperties {
  '名稱'?: {
    title?: Array<{
      text?: {
        content?: string;
      };
    }>;
  };
  '內容'?: {
    rich_text?: Array<{
      text?: {
        content?: string;
      };
    }>;
  };
  'Tag'?: {
    select?: {
      name?: string;
    };
  };
  '評分'?: {
    number?: number;
  };
  '日期'?: {
    date?: {
      start?: string;
    };
  };
  '建立時間'?: {
    created_time?: string;
  };
}

/**
 * 日誌資料庫的 Notion Page 型別
 * 與 Notion SDK 的 PageObjectResponse 相容
 */
export interface NotionLogPage {
  id: string;
  created_time: string;
  properties: NotionLogProperties;
  [key: string]: any; // 允許其他 Notion API 欄位
}

/**
 * 前端使用的成就記錄型別
 */
export interface RecentWin {
  id: string;
  title: string;
  content: string;
  category: string;
  impact: number;
  date: string;
  createdAt: string;
}
