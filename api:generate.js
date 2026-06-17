import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "NO API KEY" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const { departure, companion, budget, days, purpose } = req.body || {};

    const prompt = `
あなたは旅行プランナーです。
**必ずJSONだけ返すこと**

{
  "test": "ok"
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("RAW AI OUTPUT:", text);

    let cleaned = text.replace(/```json/g, "").replace(/```/g, "");

    let data;
    try {
      data = JSON.parse(cleaned);
    } catch (e) {
      return res.status(500).json({
        error: "JSON PARSE FAILED",
        raw: cleaned,
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({
      error: "SERVER ERROR",
      detail: err.message,
    });
  }
}
