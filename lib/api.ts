const API_URL = process.env.NEXT_PUBLIC_CAREER_API_URL!;
export type CareerAssistantPayload = Record<string, unknown>;
export async function callCareerAssistant(payload: CareerAssistantPayload) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || "API Request Failed");
  }

  return response.json();
}