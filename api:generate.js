const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "API Key is missing." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { departure, companion, budget, days, purpose } = req.body;

    const systemPrompt = `
あなたは一流の日本旅行コンシェルジュです。実在する施設・店舗のみを使用した旅行プランをJSONで作成してください。
【厳守事項】
- 架空の店名は絶対に禁止。Googleマップに存在する場所のみ。
- timelineのtimeは必ず "HH:MM" 形式。
- 回答は純粋なJSONデータのみ（マークダウン記法不要）。

【入力条件】
出発地: ${departure}, 同行者: ${companion}, 予算: ${budget}, 日数: ${days}, 目的: ${purpose}

【期待するJSON構造】
{
  "destination": "目的地名",
  "tagline": "魅力的なコピー",
  "timeline": [{ "day": 1, "items": [{ "time": "09:00", "event": "内容" }] }],
  "spots": [{ "type": "sightseeing"|"food"|"hotel", "name": "正式名称", "description": "解説" }],
  "points": ["コツ1", "コツ2", "コツ3"],
  "items": ["持ち物1", "2", "3", "4", "5"]
}
`;

    try {
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        let text = response.text().trim();
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        res.status(200).json(JSON.parse(text));
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "Failed to generate travel plan." });
    }
};