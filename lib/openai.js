import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const extractCROIdeas = async (websiteContent) => {
  try {
    // Ensure we only send pages that have images
    let formattedContent = websiteContent
      .map((page) => `URL: ${page.url}\nContent: ${page.text}\nImages: ${page.images.join(", ")}`)
      .join("\n\n")
      .slice(0, 7000); // Limit character count to avoid token overflow

    const prompt = `Analyze the following website content and extract A/B test ideas, including:
1. **Hypothesis**: What is being tested?
2. **Variation Images**: Analyze the provided image links and determine how they are used for A/B testing.
3. **Outcome**: What could be the expected impact of this test?

Ensure images are part of the analysis.

Return the results in **valid JSON format** with proper escaping:
{
  "tests": [
    {
      "url": "https://example.com/page",
      "hypothesis": "Changing the CTA button color to green will increase conversions.",
      "variation_images": ["https://example.com/img1.jpg"],
      "expected_outcome": "Higher conversion rates due to better CTA visibility."
    }
  ]
}

Here is the website data:

${formattedContent}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "system", content: prompt }],
      max_tokens: 1000, // Limit output size
    });

    let textResponse = response.choices[0].message.content;

    // Ensure we extract only valid JSON (handle AI returning markdown)
    const jsonStart = textResponse.indexOf("{");
    const jsonEnd = textResponse.lastIndexOf("}") + 1;
    let jsonString = textResponse.substring(jsonStart, jsonEnd);

    // Fix common JSON issues
    jsonString = jsonString
      .replace(/```json/g, "") // Remove markdown JSON markers
      .replace(/```/g, "") // Remove remaining markdown ticks
      .replace(/\n/g, "") // Remove new lines
      .replace(/\t/g, "") // Remove tabs
      .replace(/\r/g, "") // Remove carriage returns

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("OpenAI Error:", error);
    return { tests: [] };
  }
};