import { openai } from "./openai";

export async function generateIncidentAnalysis(
  target: string,
  statusCode: number,
  errorMessage: string,
  monitorType: string = "website"
) {
  const typeContext: Record<string, string> = {
    website: "website/HTTP endpoint",
    api:     "REST API endpoint",
    ssl:     "SSL/TLS certificate",
    tcp:     "TCP port/service",
    ping:    "ping/ICMP host",
  };

  const context = typeContext[monitorType] ?? "infrastructure endpoint";

  const prompt = `
Analyze this ${context} monitor failure:
Target: ${target}
Monitor Type: ${monitorType.toUpperCase()}
Status Code: ${statusCode > 0 ? statusCode : "N/A"}
Error: ${errorMessage}

Return ONLY raw JSON (no markdown, no backticks) in this exact format:
{"cause": "concise reason for the failure", "action": "specific actionable fix", "severity": "low|medium|high|critical"}
  `.trim();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const content = completion.choices[0].message.content?.trim() || "";
    const jsonString = content.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      cause: "Connection failure or timeout",
      action: "Check server status and DNS settings",
      severity: "high",
    };
  }
}