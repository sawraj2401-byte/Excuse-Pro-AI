const { GoogleGenAI } = require("@google/genai");

exports.handler = async (event) => {
  // This connects to the specific variable name you saved in Netlify
  const genAI = new GoogleGenAI(process.env.Gemini_api_key);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const { situation } = JSON.parse(event.body);
    const result = await model.generateContent(`Give me a funny excuse for: ${situation}`);
    const response = await result.response;
    
    return {
      statusCode: 200,
      body: JSON.stringify({ excuse: response.text() }),
    };
  } catch (error) {
    console.error(error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "AI failed to generate excuse." }) 
    };
  }
};
