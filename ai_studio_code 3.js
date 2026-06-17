/**
 * サーバーサイド (Vercel Serverless Function)
 * Gemini APIを使用して旅行プランを生成します。
 */
const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
    // POSTリクエストのみ許可
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    // 環境変数からAPIキーを取得
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "API Key is missing." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { departure, companion, budget, days, purpose } = req.body;

    // AIへの命令（プロンプト）
    const systemPrompt = `
あなたは超一流の日本旅行コンシェルジュです。
実在する日本の観光地・飲食店・ホテルのみを厳選した最高の旅行プランを提案してください。

【制約事項】
1. ハルシネーション（実在しない店名）は絶対に避けること。
2. タイムラインの時間は必ず "HH:MM" 形式で記述すること。
3. 出力は必ず以下のJSONフォーマットのみを返し、前後の説明文や\`\`\`jsonタグなどは一切含めないでください。

【入力条件】
出発地: ${departure}
同行者: ${companion}
予算: ${budget}
日数: ${days}
目的: ${purpose}

【期待するJSON構造】
{
  "destination": "目的地名",
  "tagline": "旅を一言で表す魅力的なキャッチコピー",
  "timeline": [
    { "day": 1, "items": [{ "time": "09:00", "event": "行動内容" }] }
  ],
  "spots": [
    { "type": "sightseeing"|"food"|"hotel", "name": "Googleマップで検索可能な正確な名称", "description": "解説" }
  ],
  "points": ["旅のコツ1", "旅のコツ2", "旅のコツ3"],
  "items": ["おすすめ持ち物1", "持ち物2", "持ち物3", "持ち物4", "持ち物5"]
}
`;

    try {
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        let text = response.text().trim();
        
        // マークダウンのコードブロックが含まれている場合のクリーニング
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        // JSONをパースしてクライアントに返却
        const planJson = JSON.parse(text);
        res.status(200).json(planJson);

    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ error: "Failed to generate travel plan." });
    }
};