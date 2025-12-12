import OpenAI from "openai";

interface AISettings {
  token: string;
  baseUrl: string;
  model: string;
}

let openaiClient: OpenAI | null = null;
let currentModel: string = "google/gemini-2.0-flash-001";
let isInitialized: boolean = false;

export async function initializeLiaraAI(): Promise<boolean> {
  try {
    const response = await fetch("/api/vitrin-ai-settings");
    if (!response.ok) {
      console.warn("⚠️ تنظیمات AI در دسترس نیست");
      return false;
    }
    
    const settings: AISettings = await response.json();
    
    if (!settings.token || !settings.baseUrl) {
      console.warn("⚠️ توکن یا آدرس API لیارا تنظیم نشده");
      return false;
    }

    openaiClient = new OpenAI({
      baseURL: settings.baseUrl,
      apiKey: settings.token,
      dangerouslyAllowBrowser: true,
    });
    
    currentModel = settings.model || "google/gemini-2.0-flash-001";
    isInitialized = true;
    console.log("🤖 سرویس لیارا AI در فرانت‌اند راه‌اندازی شد");
    return true;
  } catch (error) {
    console.error("❌ خطا در راه‌اندازی لیارا AI:", error);
    return false;
  }
}

export function isAIActive(): boolean {
  return isInitialized && openaiClient !== null;
}

export async function generateResponse(message: string, storeName?: string, products?: any[]): Promise<string> {
  if (!openaiClient) {
    throw new Error("Liara AI فعال نیست");
  }

  try {
    let productContext = "";
    if (products && products.length > 0) {
      productContext = `\n\nمحصولات موجود در فروشگاه:\n${products.map(p => 
        `- ${p.name}: ${p.priceAfterDiscount || p.priceBeforeDiscount} تومان${p.description ? ` (${p.description})` : ''}`
      ).join('\n')}`;
    }

    const prompt = `تو دستیار هوشمند فروشگاه "${storeName || 'ویترین'}" هستی و به زبان فارسی پاسخ می‌دهی.${productContext}

لطفاً به این پیام مشتری پاسخ دهید:
${message}

پاسخ تو باید:
- به زبان فارسی باشد
- حداکثر 50 کلمه باشد
- مؤدبانه و مفید باشد
- اگر سوال درباره محصولی است، اطلاعات آن را بده`;

    const completion = await openaiClient.chat.completions.create({
      model: currentModel,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = completion.choices[0].message.content || "متأسفانه نتوانستم پاسخ مناسبی تولید کنم.";
    return text.trim();
  } catch (error) {
    console.error("❌ خطا در تولید پاسخ لیارا:", error);
    throw new Error("خطا در تولید پاسخ هوش مصنوعی");
  }
}
