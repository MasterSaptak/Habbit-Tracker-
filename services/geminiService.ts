import { GoogleGenAI, Type } from "@google/genai";
import { Hobby, Log, AIAdvice, AISuggestion, FrequencyType } from "../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getHobbyCoaching = async (hobby: Hobby): Promise<AIAdvice> => {
  const ai = getClient();
  const recentLogs = hobby.logs.slice(-5);
  
  // Calculate Progress for Context
  const now = new Date();
  let completedCount = 0;
  let timeframeLabel = '';
  
  if (hobby.frequencyType === FrequencyType.Daily) {
    completedCount = hobby.logs.filter(l => new Date(l.date).toDateString() === now.toDateString()).length;
    timeframeLabel = 'today';
  } else if (hobby.frequencyType === FrequencyType.Weekly) {
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    completedCount = hobby.logs.filter(l => new Date(l.date) > oneWeekAgo).length;
    timeframeLabel = 'in the past 7 days';
  } else {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    completedCount = hobby.logs.filter(l => new Date(l.date) > thirtyDaysAgo).length;
    timeframeLabel = 'in the past 30 days';
  }

  const progressPercent = Math.round((completedCount / hobby.targetFrequency) * 100);
  const status = progressPercent >= 100 ? "Goal Met" : progressPercent >= 50 ? "On Track" : "Falling Behind";
  
  const prompt = `
    I am tracking a hobby called "${hobby.name}". 
    Description: ${hobby.description}.
    
    Current Goal: ${hobby.targetFrequency} times per ${hobby.frequencyType}.
    Current Progress: ${completedCount}/${hobby.targetFrequency} sessions completed ${timeframeLabel} (${progressPercent}% - ${status}).
    
    My recent activity logs: ${JSON.stringify(recentLogs.map(l => ({ date: l.date, duration: l.durationMinutes, notes: l.notes, rating: l.rating })))}.
    
    Based on this, provide a JSON response with:
    1. A practical improvement tip.
    2. A motivational quote or sentence specific to my progress (acknowledge if I am ahead or behind).
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