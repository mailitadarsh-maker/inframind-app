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
You are a senior SRE. Analyze this ${context} failure:
Target: ${target}
Status Code: ${statusCode > 0 ? statusCode : "N/A"}
Error: ${errorMessage}

Instructions:
1. Provide a deep, insightful analysis of WHY this failed. Explain the technical root cause in simple, plain English.
2. Provide a 3-5 step numbered checklist of EXACTLY what to do to fix it. Each step must be on a new line.
3. Be specific (e.g., mention DNS, SSL handshakes, server load, or firewall blocks).

Return ONLY raw JSON in this exact format:
{
  "cause": "2-sentence explanation of why it happened.",
  "action": "1. [Step 1]\n2. [Step 2]\n3. [Step 3]",
  "severity": "low|medium|high|critical"
}
  `.trim();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1, // Lower temperature for more consistent, technical advice
    });

    const content = completion.choices[0].message.content?.trim() || "";
    // Clean up content to ensure pure JSON
    const jsonString = content.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      cause: "The service is currently unreachable.",
      action: "1. Verify your server is online.\n2. Check your DNS and firewall settings.\n3. Review your last deployment logs.",
      severity: "high",
    };
  }
}