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

    const prompt = `你是一位嚴格的履歷顧問，專門幫助工程師篩選並撰寫真正高質量的履歷條目。

本週工作記錄（包含自我評分 1-5）：
${logsText}

任務：請從中篩選出真正值得寫入「年度績效回顧」或「求職履歷」的亮點。

篩選與判斷標準（嚴格執行）：
1. **重視影響力**：優先考慮評分 (Impact) 為 4 或 5 的項目。評分較低的項目除非有明顯的技術深度或長期價值，否則應直接忽略。
2. **排除日常瑣事**：一般的會議、簡單的 Bug Fix、文檔維護、例行性依賴更新等，**不應**納入履歷。
3. **成果導向**：只收錄有明確「產出」或「解決了困難問題」的項目。

撰寫規範（Critical）：
1. **絕對禁止編造數據**：如果原始日誌中沒有提到具體的百分比（如「提升 50%」）或具體時間數值，**請勿自行腦補或添加**。請使用定性的描述（如「顯著改善」、「成功導入」）來代替虛構的數字。
2. **實事求是**：不要過度誇大。保持專業、精準。
3. **格式**：使用「Action Verb + Context + Result」格式，繁體中文。

如果本週沒有任何值得大書特書的成就，請直接回傳 hasResumeWorthyContent: false。不要為了湊數而產生內容。

請以 JSON 格式返回：
{
  "hasResumeWorthyContent": true/false,
  "bullets": [
    {
      "text": "履歷條目文字（不含虛構數據）",
      "category": "Achievement/Skill/Project",
      "impactLevel": "High/Medium/Low",
      "reasoning": "為什麼這個值得放進履歷（請簡述判斷依據）"
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
