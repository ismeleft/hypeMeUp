import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

export async function GET(request: NextRequest) {
  try {
    const notion = new Client({
      auth: process.env.NOTION_API_KEY,
    });

    const databaseId = process.env.NOTION_DATABASE_ID_RESUME!;

    // 查詢資料庫結構
    const database = await notion.databases.retrieve({
      database_id: databaseId,
    });

    return NextResponse.json({
      success: true,
      properties: database.properties,
    });
  } catch (error) {
    console.error('Error testing career database:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
