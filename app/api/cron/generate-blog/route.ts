import { NextResponse } from "next/server";
import { generateBlogPost, pickUnusedTopic } from "@/lib/generateBlogPost";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = [];
  const errors = [];
  const usedTopics: string[] = [];

  for (let i = 0; i < 2; i++) {
    const topic = await pickUnusedTopic(usedTopics);
    usedTopics.push(topic);
    try {
      const result = await generateBlogPost(topic);
      results.push(result);
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  return NextResponse.json({ success: errors.length === 0, results, errors });
}
