import { NextRequest, NextResponse } from 'next/server';
import { createDailyLog } from '@/lib/notion';
import { VALID_CATEGORIES, IMPACT_MIN, IMPACT_MAX, isValidCategory, isValidImpact } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    // 解析請求 body
    const body = await request.json();
    const { content, category, impact } = body;

    // 驗證必要欄位
    if (!content || !category || !impact) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: content, category, or impact',
        },
        { status: 400 }
      );
    }

    // 驗證 impact 範圍
    if (!isValidImpact(impact)) {
      return NextResponse.json(
        {
          success: false,
          error: `Impact must be between ${IMPACT_MIN} and ${IMPACT_MAX}`,
        },
        { status: 400 }
      );
    }

    // 驗證 category
    if (!isValidCategory(category)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 建立 Notion 記錄
    const result = await createDailyLog({
      content,
      category,
      impact,
      date: new Date(),
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to create daily log',
        },
        { status: 500 }
      );
    }

    // 成功回應
    return NextResponse.json(
      {
        success: true,
        message: 'Daily log created successfully!',
        pageId: result.pageId,
      },
      { status: 201 }
    );
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

// 支援 GET 請求來測試 API
export async function GET() {
  return NextResponse.json({
    message: 'HypeMeUp API is running!',
    endpoints: {
      POST: '/api/hype - Submit daily achievement',
    },
  });
}
