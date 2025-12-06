import { NextRequest, NextResponse } from 'next/server';
import { getThisWeekLogs, createWeeklyReport, createCareerReport } from '@/lib/notion';
import { analyzeResumeBullets, type DailyLogForAI } from '@/lib/openai';

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
    const contentItems: string[] = [];
    const logsForAI: DailyLogForAI[] = [];

    logs.forEach((log: any) => {
      const properties = log.properties;
      const category = properties['Tag']?.select?.name;
      const impact = properties['評分']?.number || 0;
      const content = properties['內容']?.rich_text?.[0]?.text?.content || '';
      const date = properties['日期']?.date?.start || '';

      if (category) {
        categories.set(category, (categories.get(category) || 0) + 1);
      }
      totalImpact += impact;

      // 收集內容
      if (content) {
        contentItems.push(`• ${content}`);

        // 準備 AI 分析用的資料
        logsForAI.push({
          date,
          content,
          category: category || 'Other',
          impact,
        });
      }
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
    const weeklyContent = contentItems.join('\n');

    const result = await createWeeklyReport({
      week: weekLabel,
      dateRange: {
        start: dateStart,
        end: dateEnd,
      },
      tags,
      content: weeklyContent,
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

    // 5. 使用 AI 分析履歷建議
    const resumeAnalysis = await analyzeResumeBullets(logsForAI);
    let resumeBulletsCreated = 0;

    if (resumeAnalysis.success && resumeAnalysis.result.hasResumeWorthyContent) {
      // 將建議的履歷條目寫入 Notion
      for (const bullet of resumeAnalysis.result.bullets) {
        const bulletResult = await createCareerReport({
          bulletPoint: bullet.text,
          type: bullet.category,
          reasoning: bullet.reasoning,
        });

        if (bulletResult.success) {
          resumeBulletsCreated++;
        }
      }
    }

    // 6. 回傳統計資料
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
        resumeAnalysis: resumeAnalysis.success
          ? {
              hasResumeWorthyContent: resumeAnalysis.result.hasResumeWorthyContent,
              bulletsCreated: resumeBulletsCreated,
              bullets: resumeAnalysis.result.bullets,
            }
          : {
              error: resumeAnalysis.error,
            },
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
