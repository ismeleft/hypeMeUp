import { NextRequest, NextResponse } from 'next/server';
import { getThisWeekLogs, createWeeklyReport } from '@/lib/notion';

export async function POST(request: NextRequest) {
  try {
    // 1. 取得本週的所有日誌
    const logsResult = await getThisWeekLogs();

    if (!logsResult.success || !logsResult.logs) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch weekly logs',
        },
        { status: 500 }
      );
    }

    const logs = logsResult.logs;

    if (logs.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No logs found for this week',
        },
        { status: 400 }
      );
    }

    // 2. 整理數據
    const categories = new Map<string, number>();
    let totalImpact = 0;

    logs.forEach((log: any) => {
      const properties = log.properties;
      const category = properties['Tag']?.select?.name;
      const impact = properties['評分']?.number || 0;

      if (category) {
        categories.set(category, (categories.get(category) || 0) + 1);
      }
      totalImpact += impact;
    });

    // 3. 計算週次和日期範圍
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

    // 計算週次 (ISO week number)
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(
      ((today.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
    );

    const weekLabel = `${today.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
    const dateStart = startOfWeek.toISOString().split('T')[0];
    const dateEnd = endOfWeek.toISOString().split('T')[0];

    // 4. 建立週報
    const tags = Array.from(categories.keys());
    const result = await createWeeklyReport({
      week: weekLabel,
      dateRange: {
        start: dateStart,
        end: dateEnd,
      },
      tags,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to create weekly report',
        },
        { status: 500 }
      );
    }

    // 5. 回傳統計資料
    return NextResponse.json({
      success: true,
      report: {
        pageId: result.pageId,
        week: weekLabel,
        dateRange: `${dateStart} to ${dateEnd}`,
        totalLogs: logs.length,
        totalImpact,
        averageImpact: (totalImpact / logs.length).toFixed(1),
        categories: Object.fromEntries(categories),
      },
    });
  } catch (error) {
    console.error('Error generating weekly report:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
