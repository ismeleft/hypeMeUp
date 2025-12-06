import OpenAI from 'openai';

// 初始化 OpenAI client
const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not defined');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

// ==================== 履歷智慧更新建議 ====================

export interface DailyLogForAI {
  date: string;
  content: string;
  category: string;
  impact: number;
}

export interface ResumeBullet {
  text: string;           // 履歷條目文字
  category: string;       // Achievement/Skill/Project
  impactLevel: string;    // High/Medium/Low
  reasoning: string;      // 為什麼這個值得放進履歷
}

export interface ResumeAnalysisResult {
  hasResumeWorthyContent: boolean;
  bullets: ResumeBullet[];
}

/**
 * 分析週報記錄，產生履歷更新建議
 */
export async function analyzeResumeBullets(
  logs: DailyLogForAI[]
): Promise<{ success: true; result: ResumeAnalysisResult } | { success: false; error: string }> {
  const openai = getOpenAIClient();

  try {
    // 準備 prompt
    const logsText = logs
      .map((log) => `- ${log.date} [${log.category}] (評分: ${log.impact}/5) ${log.content}`)
      .join('\n');

    const prompt = `你是一位頂尖的履歷顧問，專門幫助工程師打造 ATS-friendly 的履歷。

本週工作記錄：
${logsText}

請分析是否有值得寫進履歷的成就。

判斷標準（必須滿足至少一項）：
1. 可量化的影響（時間節省、成本降低、效率提升）
2. 技術突破或創新
3. 跨團隊協作或領導力展現
4. 重大專案完成
5. 學習並應用新技術/框架

輸出格式要求：
- 使用「Action Verb + Context + Quantified Result」格式
- 用繁體中文撰寫
- 盡量量化成果
- 專業但自信的語氣

如果只是日常瑣事（例如：參加會議、修小 bug、寫文件），則回傳 hasResumeWorthyContent: false

請以 JSON 格式返回：
{
  "hasResumeWorthyContent": true/false,
  "bullets": [
    {
      "text": "履歷條目文字（Action Verb + Context + Quantified Result）",
      "category": "Achievement/Skill/Project",
      "impactLevel": "High/Medium/Low",
      "reasoning": "為什麼這個值得放進履歷"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '你是一位頂尖的履歷顧問，專門幫助專業人士識別並撰寫有影響力的履歷條目。你擅長將日常工作轉化成量化的成就描述。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        success: false,
        error: 'No response from OpenAI',
      };
    }

    const result = JSON.parse(content) as ResumeAnalysisResult;

    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error('Error analyzing resume bullets:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ==================== 每日記錄摘要 ====================

export interface DailySummaryResult {
  summary: string;
  tags: string[];
}

/**
 * 生成每日記錄摘要和標籤
 */
export async function generateDailySummary(
  content: string
): Promise<{ success: true; result: DailySummaryResult } | { success: false; error: string }> {
  const openai = getOpenAIClient();

  try {
    const prompt = `請將以下工作日誌總結成 1-2 句話，並提取 2-4 個關鍵詞作為標籤。

日誌內容：
${content}

請用繁體中文回答，並以 JSON 格式返回：
{
  "summary": "簡短摘要（1-2句話）",
  "tags": ["標籤1", "標籤2", "標籤3"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '你是一個簡潔但有洞察力的工作日誌分析師。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });

    const responseContent = response.choices[0]?.message?.content;
    if (!responseContent) {
      return {
        success: false,
        error: 'No response from OpenAI',
      };
    }

    const result = JSON.parse(responseContent) as DailySummaryResult;

    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error('Error generating daily summary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ==================== 隨機誇獎生成 ====================

/**
 * 根據 Hype Level 生成誇獎語句
 */
export async function generatePraise(
  content: string,
  hypeLevel: number
): Promise<{ success: true; praise: string } | { success: false; error: string }> {
  const openai = getOpenAIClient();

  try {
    const prompt = `你是一個充滿熱情的職場啦啦隊長。

用戶剛完成了：${content}
Hype Level: ${hypeLevel}/5

請根據 Hype Level 生成一句誇張但激勵的誇獎語句：
- Level 1-2: 鼓勵但溫和
- Level 3: 肯定並給予信心
- Level 4: 熱情讚美
- Level 5: 超級誇張的讚美

要求：
- 幽默、誇張、充滿能量
- 用繁體中文
- 一句話即可（不超過 30 字）
- 可以加入適當的 emoji

請直接回傳誇獎語句，不需要 JSON 格式。`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '你是一個充滿熱情、幽默風趣的職場啦啦隊長。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9,
      max_tokens: 100,
    });

    const praise = response.choices[0]?.message?.content?.trim();
    if (!praise) {
      return {
        success: false,
        error: 'No response from OpenAI',
      };
    }

    return {
      success: true,
      praise,
    };
  } catch (error) {
    console.error('Error generating praise:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
