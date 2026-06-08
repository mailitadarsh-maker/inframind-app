import { NextResponse } from "next/server";
import { generateIncidentAnalysis } from "@/lib/ai-analysis";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Calling the function as defined in your lib/ai-analysis
    const result = await generateIncidentAnalysis(
      "https://example.com",
      503,
      "Service Unavailable: Connection Timeout"
    );

    // This will now output the JSON to your browser
    return NextResponse.json({
      status: "success",
      data: result
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}