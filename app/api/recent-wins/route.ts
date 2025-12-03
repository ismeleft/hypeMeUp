import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

export async function GET(request: NextRequest) {
  try {
    // 從查詢參數取得 limit（預設 5 筆）
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '5');

    // 直接在這裡初始化 Notion client
    const notion = new Client({
      auth: process.env.NOTION_API_KEY,
    });

    // 直接查詢 Notion
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID_LOGS!,
      sorts: [
        {
          property: '建立時間',
          direction: 'descending',
        },
      ],
      page_size: limit,
    });

    const result = {
      success: true,
      logs: response.results,
    };

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to fetch recent logs',
        },
        { status: 500 }
      );
    }

    // 轉換 Notion 格式為前端需要的格式
    const wins = result.logs.map((page: any) => {
      const properties = page.properties;

      return {
        id: page.id,
        title: properties['名稱']?.title?.[0]?.text?.content || 'Untitled',
        content: properties['內容']?.rich_text?.[0]?.text?.content || '',
        category: properties['Tag']?.select?.name || '',
        impact: properties['評分']?.number || 0,
        date: properties['日期']?.date?.start || '',
        createdAt: properties['建立時間']?.created_time || page.created_time,
      };
    });

    return NextResponse.json({
      success: true,
      wins,
      count: wins.length,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
