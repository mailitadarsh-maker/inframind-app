import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, postUrl } = await req.json();

    if (!postUrl) {
      return NextResponse.json(
        { error: "LinkedIn URL required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        linkedin_post_url: postUrl,
        linkedin_reward_status: "pending",
        linkedin_submitted_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Submission sent for review",
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to submit" },
      { status: 500 }
    );
  }
}