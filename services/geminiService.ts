import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are Aether-AI, a digital twin of a high-end avant-garde product designer. 
Your personality is: Minimalist, Analytical, Futurist, and slightly abstract.
You answer questions about design philosophy, aesthetics, and the future of technology.
Keep answers concise, sophisticated, and use lower-case text often for aesthetic reasons.
Do not act like a generic assistant. Act like a senior design director reviewing work or discussing theory.
`;

export const sendMessageToGemini = async (
  history: { role: string; text: string }[],
  newMessage: string
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        // Using a small thinking budget to demonstrate reasoning for "design" questions
        thinkingConfig: { thinkingBudget: 1024 }, 
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "Design protocol interrupted. Re-establishing link...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Connection to neural interface unstable.";
  }
};
