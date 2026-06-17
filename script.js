import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const { departure, companion, budget, days, purpose } = req.body || {};

    const prompt = `
あなたは旅行プランナーです。
必ずJSONだけ返してください。

出発地:${departure}
同行者:${companion}
予算:${budget}
日数:${days}
目的:${purpose}
`;

    const result = await model.generateContent(prompt);
    const text = (await result.response).text();

    const cleaned = text.replace(/```json/g, "").replace(/```/g, "");

    return res.status(200).json(JSON.parse(cleaned));

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
