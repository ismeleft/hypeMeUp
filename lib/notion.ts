import { Client } from '@notionhq/client';

// 初始化 Notion client
const getNotionClient = () => {
  if (!process.env.NOTION_API_KEY) {
    throw new Error('NOTION_API_KEY is not defined');
  }
  return new Client({
    auth: process.env.NOTION_API_KEY,
  });
};

// Database IDs
const DAILY_LOGS_DB = process.env.NOTION_DATABASE_ID_LOGS!;
const WEEKLY_REPORTS_DB = process.env.NOTION_DATABASE_ID_REPORTS!;
const CAREER_REPORTS_DB = process.env.NOTION_DATABASE_ID_RESUME!;

// ==================== Daily Logs ====================

export interface DailyLogInput {
  content: string;      // 內容
  category: string;     // Tag (Project/Learning/Communication/Crisis)
  impact: number;       // 評分 (1-5)
  date?: Date;          // 日期 (optional, defaults to today)
}

/**
 * 建立每日記錄到 Notion
 */
export async function createDailyLog(input: DailyLogInput) {
  const notion = getNotionClient();
  const date = input.date || new Date();
  const dateString = date.toISOString().split('T')[0]; // 2025-12-03

  try {
    const response = await notion.pages.create({
      parent: {
        database_id: DAILY_LOGS_DB,
      },
      properties: {
        // 名稱 (Title)
        '名稱': {
          title: [
            {
              text: {
                content: `${dateString} - ${input.category}`,
              },
            },
          ],
        },
        // 內容 (Text)
        '內容': {
          rich_text: [
            {
              text: {
                content: input.content,
              },
            },
          ],
        },
        // 日期 (Date)
        '日期': {
          date: {
            start: dateString,
          },
        },
        // Tag (Select - 單選)
        'Tag': {
          select: {
            name: input.category,
          },
        },
        // 評分 (Number)
        '評分': {
          number: input.impact,
        },
      },
    });

    return {
      success: true,
      pageId: response.id,
      data: response,
    };
  } catch (error) {
    console.error('Error creating daily log:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 取得本週的所有日誌記錄
 */
export async function getThisWeekLogs() {
  const notion = getNotionClient();
  const today = new Date();
  const startOfWeek = new Date(today);
  // 處理禮拜日的情況 (getDay() = 0)
  const dayOfWeek = today.getDay();
  const daysFromMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(today.getDate() + daysFromMonday); // Monday
  startOfWeek.setHours(0, 0, 0, 0);

  try {
    const response = await notion.databases.query({
      database_id: DAILY_LOGS_DB,
      filter: {
        property: '日期',
        date: {
          on_or_after: startOfWeek.toISOString().split('T')[0],
        },
      },
      sorts: [
        {
          property: '日期',
          direction: 'ascending',
        },
      ],
    });

    return {
      success: true,
      logs: response.results,
    };
  } catch (error) {
    console.error('Error fetching weekly logs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      logs: [],
    };
  }
}

/**
 * 取得最近的 N 筆日誌記錄
 */
export async function getRecentLogs(limit: number = 5) {
  const notion = getNotionClient();
  try {
    const response = await notion.databases.query({
      database_id: DAILY_LOGS_DB,
      sorts: [
        {
          property: '建立時間',
          direction: 'descending',
        },
      ],
      page_size: limit,
    });

    return {
      success: true,
      logs: response.results,
    };
  } catch (error) {
    console.error('Error fetching recent logs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      logs: [],
    };
  }
}

// ==================== Weekly Reports ====================

export interface WeeklyReportInput {
  week: string;         // 名稱 (例: 2025-W49)
  dateRange: {
    start: string;
    end: string;
  };
  tags?: string[];      // Tag
  content?: string;     // 內容 (本週做了什麼)
}

/**
 * 建立週報到 Notion
 */
export async function createWeeklyReport(input: WeeklyReportInput) {
  const notion = getNotionClient();
  try {
    const response = await notion.pages.create({
      parent: {
        database_id: WEEKLY_REPORTS_DB,
      },
      properties: {
        // 名稱 (Title)
        '名稱': {
          title: [
            {
              text: {
                content: input.week,
              },
            },
          ],
        },
        // 日期 (Date with range)
        '日期': {
          date: {
            start: input.dateRange.start,
            end: input.dateRange.end,
          },
        },
        // 內容 (Rich text) - optional
        ...(input.content && {
          '內容': {
            rich_text: [
              {
                text: {
                  content: input.content,
                },
              },
            ],
          },
        }),
        // Tag (Multi-select) - optional
        ...(input.tags && input.tags.length > 0 && {
          'Tag': {
            multi_select: input.tags.map(tag => ({ name: tag })),
          },
        }),
      },
    });

    return {
      success: true,
      pageId: response.id,
      data: response,
    };
  } catch (error) {
    console.error('Error creating weekly report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ==================== Career Reports ====================

export interface CareerReportInput {
  bulletPoint: string;  // 名稱 (Title)
  type: string;         // Type (Achievement/Skill/Project)
  date?: Date;          // 日期
  reasoning?: string;   // Reasoning
}

/**
 * 建立履歷條目到 Notion
 */
export async function createCareerReport(input: CareerReportInput) {
  const notion = getNotionClient();
  const date = input.date || new Date();
  const dateString = date.toISOString().split('T')[0];

  try {
    const response = await notion.pages.create({
      parent: {
        database_id: CAREER_REPORTS_DB,
      },
      properties: {
        // 名稱 (Title)
        '名稱': {
          title: [
            {
              text: {
                content: input.bulletPoint,
              },
            },
          ],
        },
        // Type (Select)
        'Type': {
          select: {
            name: input.type,
          },
        },
        // 日期 (Date)
        '日期': {
          date: {
            start: dateString,
          },
        },
        // Reasoning (Text) - optional
        ...(input.reasoning && {
          ' Reasoning': {
            rich_text: [
              {
                text: {
                  content: input.reasoning,
                },
              },
            ],
          },
        }),
      },
    });

    return {
      success: true,
      pageId: response.id,
      data: response,
    };
  } catch (error) {
    console.error('Error creating career report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ==================== Utility Functions ====================

/**
 * 測試 Notion 連線
 */
export async function testNotionConnection() {
  const notion = getNotionClient();
  try {
    // 嘗試查詢 Daily Logs database
    const response = await notion.databases.query({
      database_id: DAILY_LOGS_DB,
      page_size: 1,
    });

    return {
      success: true,
      message: 'Notion connection successful!',
      databaseId: DAILY_LOGS_DB,
    };
  } catch (error) {
    console.error('Notion connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
