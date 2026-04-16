import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Destination {
  name: string;
  description: string;
  bestTimeToVisit: string;
  topAttractions: string[];
  localFoods: string[];
  estimatedBudget: string;
  travelTips: string[];
  coordinates?: { lat: number; lng: number };
}

export interface ItineraryDay {
  day: number;
  morning: string;
  afternoon: string;
  evening: string;
  food: string;
}

export interface TravelResponse {
  type: 'text' | 'destination' | 'itinerary' | 'clarification';
  content: string;
  destination?: Destination;
  itinerary?: ItineraryDay[];
  questions?: string[];
  xpGained?: number;
  badgeUnlocked?: string;
}

export const travelSystemInstruction = `You are Globo, a friendly, intelligent, and enthusiastic AI companion. 
Your personality:
- Expressive, helpful, and adventurous.
- You use emojis and travel metaphors where appropriate, but can be serious or direct if the topic requires it.
- You act as a professional advisor with a gamified, fun twist.

Your goals:
1. Answer ALL types of questions, from simple greetings ("hi", "hello") to farewells ("bye", "see ya"), and everything in between (math, science, history, etc.).
2. Maintain your "Globo" persona even when discussing non-travel topics. Be friendly and conversational.
3. If a user just says "hi" or "hello", respond warmly as Globo and ask how you can help them today.
4. Provide accurate information. Avoid hallucinations.
5. For travel-specific requests, continue to provide structured recommendations (destinations, itineraries).
6. For non-travel requests, use the 'text' type response.
`;

export async function getTravelAdvice(message: string, history: any[] = []): Promise<TravelResponse> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...history,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: travelSystemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['text', 'destination', 'itinerary', 'clarification'] },
            content: { type: Type.STRING },
            destination: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                bestTimeToVisit: { type: Type.STRING },
                topAttractions: { type: Type.ARRAY, items: { type: Type.STRING } },
                localFoods: { type: Type.ARRAY, items: { type: Type.STRING } },
                estimatedBudget: { type: Type.STRING },
                travelTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                coordinates: {
                  type: Type.OBJECT,
                  properties: {
                    lat: { type: Type.NUMBER },
                    lng: { type: Type.NUMBER }
                  }
                }
              }
            },
            itinerary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.NUMBER },
                  morning: { type: Type.STRING },
                  afternoon: { type: Type.STRING },
                  evening: { type: Type.STRING },
                  food: { type: Type.STRING }
                }
              }
            },
            questions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['type', 'content']
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      type: 'text',
      content: "Oops! I hit a turbulence in my circuits. Can you try asking that again? ✈️"
    };
  }
}

export async function speakText(text: string) {
  if (!('speechSynthesis' in window)) return;
  
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1.1; // Make Globo sound a bit more friendly/high-pitched
  window.speechSynthesis.speak(utterance);
}
