import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function GET() {
  try {
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: "Explain HTTP 503 in one sentence."
    });

    return NextResponse.json({
      success: true,
      result: response.output_text
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      success: false,
      error: String(error)
    });
  }
}