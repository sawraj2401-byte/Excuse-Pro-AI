export const generateExcuse = async (situation: string) => {
  try {
    const response = await fetch('/.netlify/functions/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ situation }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.excuse;
  } catch (error) {
    console.error('Error calling Gemini bridge:', error);
    throw error;
  }
};

