export async function logEvent(
  event: string,
  extraData: Record<string, any> = {},
) {
  try {
    const res = await fetch("/api/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ event, extraData }),
    });

    if (!res.ok) {
      console.error("Failed to log event:", await res.text());
    } else {
      console.log("Event logged:", event);
    }
  } catch (error) {
    console.error("Error sending log event:", error);
  }
}
