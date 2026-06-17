import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const { departure, companion, budget, days, purpose } = req.body || {};

  const prompt = `
旅行プランをJSONだけで返して
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
}
