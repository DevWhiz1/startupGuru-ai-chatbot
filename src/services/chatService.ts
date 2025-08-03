export async function sendChatPrompt(prompt: string): Promise<string> {
  const response = await fetch('http://localhost:3000/generate-idea', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get response from backend');
  }

  const data = await response.json();
  return data.generated_text;
}