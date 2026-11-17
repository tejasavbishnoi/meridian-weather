export async function requestAI(payload) {
  let res;
  try {
    res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });
  } catch (err) {
    if (err.name === "TimeoutError") {
      throw new Error("The AI took too long to answer. Try again.", {
        cause: err,
      });
    }
    throw new Error("Could not reach the server.", { cause: err });
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "The AI request failed.");
  return data.text;
}