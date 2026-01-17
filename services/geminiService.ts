
import { GoogleGenAI } from "@google/genai";
import { ExcuseRequest, ChatMessage } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateExcuse = async (req: ExcuseRequest): Promise<string> => {
  const ai = getAI();
  const prompt = `Generate a human-written, authentic-sounding excuse. 
  
  CONTEXT:
  - Intended Recipient: ${req.recipient}
  - The Situation: ${req.situation}
  - Category of Reason: ${req.reasonType}
  - Tone to use: ${req.tone}
  - Extra Details provided: ${req.additionalDetails || 'None'}

  GUIDELINES:
  1. DO NOT mention medical or legal issues.
  2. Sound like a real person, not an AI. Use natural contractions and slightly informal phrasing if the recipient is a friend/partner.
  3. Be concise. Most human excuses are short.
  4. If the recipient is a "Boss" or "Client", be respectful but firm.
  5. Provide ONLY the final text of the message/excuse.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0.85,
    }
  });

  return response.text || "I couldn't generate an excuse. Maybe try a different reason category?";
};

export const chatWithAssistant = async (history: ChatMessage[]): Promise<string> => {
  const ai = getAI();
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: history,
    config: {
      systemInstruction: "You are the 'Excuse Assistant'. You help people refine their excuses to sound more believable and appropriate for their recipients. You are witty, slightly mischievous, but always professional in your advice. Never suggest illegal or harmful lies. Focus on social 'white lies' and logistical smoothing.",
    }
  });

  return response.text || "I'm having a bit of a creative block. What else you got?";
};
