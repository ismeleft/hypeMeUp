import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

export async function GET() {
  try {
    // 檢查環境變數
    const apiKey = process.env.NOTION_API_KEY;
    const dbId = process.env.NOTION_DATABASE_ID_LOGS;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'NOTION_API_KEY not found',
      });
    }

    if (!dbId) {
      return NextResponse.json({
        success: false,
        error: 'NOTION_DATABASE_ID_LOGS not found',
      });
    }

    // 初始化 Notion client
    const notion = new Client({ auth: apiKey });

    // 測試查詢 database
    const response = await notion.databases.query({
      database_id: dbId,
      page_size: 1,
    });

    return NextResponse.json({
      success: true,
      message: 'Notion connection successful!',
      apiKey: `${apiKey.substring(0, 10)}...`,
      databaseId: dbId,
      resultsCount: response.results.length,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      apiKey: process.env.NOTION_API_KEY ? `${process.env.NOTION_API_KEY.substring(0, 10)}...` : 'missing',
      databaseId: process.env.NOTION_DATABASE_ID_LOGS || 'missing',
    });
  }
}
