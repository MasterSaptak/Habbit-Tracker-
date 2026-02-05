import { GoogleGenAI, Type } from "@google/genai";
import { Hobby, Log, AIAdvice, AISuggestion } from "../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getHobbyCoaching = async (hobby: Hobby): Promise<AIAdvice> => {
  const ai = getClient();
  const recentLogs = hobby.logs.slice(-5);
  
  const prompt = `
    I am tracking a hobby called "${hobby.name}". 
    Description: ${hobby.description}.
    My recent activity logs: ${JSON.stringify(recentLogs.map(l => ({ date: l.date, duration: l.durationMinutes, notes: l.notes })))}.
    
    Based on this, provide a JSON response with:
    1. A practical improvement tip.
    2. A motivational quote or sentence specific to my progress.
    3. A small, achievable challenge for my next session.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tip: { type: Type.STRING },
            motivation: { type: Type.STRING },
            challenge: { type: Type.STRING },
          },
          required: ["tip", "motivation", "challenge"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AIAdvice;
  } catch (error) {
    console.error("Gemini Coaching Error:", error);
    return {
      tip: "Consistency is key! Keep going.",
      motivation: "Every expert was once a beginner.",
      challenge: "Just show up for 5 minutes today."
    };
  }
};

export const suggestNewHobbies = async (interests: string): Promise<AISuggestion[]> => {
  const ai = getClient();
  
  const prompt = `
    I am looking for new hobbies. My interests are: "${interests}".
    Suggest 3 unique hobbies that I might like.
    Return a JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
            required: ["name", "description", "reason"]
          }
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as AISuggestion[];
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return [];
  }
};
