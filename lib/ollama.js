import axios from "axios";

const OLLAMA_SERVER = "http://13.201.15.56:11434"; // Replace with your AWS IP

export const extractCROIdeas = async (websiteContent) => {
  try {
    const formattedContent = websiteContent
      .map((page) => `URL: ${page.url}\nContent: ${page.text}\nImages: ${page.images.join(", ")}`)
      .join("\n\n")
      .slice(0, 7000);

    const prompt = `Analyze the following website content and extract A/B test ideas, including:
1. **Hypothesis**: What is being tested?
2. **Variation Images**: Analyze the provided image links and determine how they are used for A/B testing.
3. **Outcome**: What could be the expected impact of this test?

Ensure images are part of the analysis.

Return the results in valid JSON format like:
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

    const response = await axios.post(`${OLLAMA_SERVER}/api/generate`, {
      model: "mistral:latest", // Ensure this matches your installed model
      prompt: prompt,
      stream: false,
    });

    return JSON.parse(response.data.response); // Ensure response is parsed correctly
  } catch (error) {
    console.error("Ollama Error:", error);
    return { tests: [] };
  }
};