import { NextRequest, NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { supabase } from "@/utils/supabase";

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

async function runChat(userInput: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(API_KEY as string);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [],
  });

  const result = await chat.sendMessage(userInput);
  const response = result.response;
  return response.text();
}

async function fetchItemCountByTag(tag: string): Promise<number> {
  const { data, error } = await supabase
    .from("ItemInventory")
    .select("item_id", { count: "exact" })
    .eq("item_category", tag);

  if (error) {
    console.error("Error fetching item count:", error);
    return 0;
  }

  return data.length;
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    const userInput = message.toLowerCase();

    // Check for specific queries
    const countMatch = userInput.match(/how many (\w+)/i);
    const urlMatch = userInput.match(/provide the url for (\w+)/i);

    if (countMatch) {
      const category = countMatch[1];
      const capitalizedCategory =
        category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

      const itemCount = await fetchItemCountByTag(capitalizedCategory);
      const url = `/member/explore?tags=${encodeURIComponent(
        capitalizedCategory
      )}`;
      return NextResponse.json({
        draftReply: `There are ${itemCount} ${capitalizedCategory} items available. You can view them ${url}`,
      });
    } else if (urlMatch) {
      const category = urlMatch[1];
      const capitalizedCategory =
        category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

      const url = `"/member/explore?tags=${encodeURIComponent(
        capitalizedCategory
      )}"`;
      return NextResponse.json({
        draftReply: `You can find ${capitalizedCategory} items ${url}`,
      });
    } else {
      // For other queries, use the AI to generate a response
      const draftReply = await runChat(userInput);
      return NextResponse.json({ draftReply });
    }
  } catch (error) {
    console.error("Error generating draft reply:", error);
    return NextResponse.json(
      { error: "Failed to generate draft reply" },
      { status: 500 }
    );
  }
}
