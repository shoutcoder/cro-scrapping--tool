import { NextResponse } from "next/server";
import { scrapeWebsite } from "../../../../lib/scraper";
import { extractCROIdeas } from "../../../../lib/ollama"; // Now using Ollama
import { supabase } from "../../../../lib/supabase";

export async function POST(req) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ message: "Website URL is required." }, { status: 400 });
    }

    // Scrape website content
    const scrapedData = await scrapeWebsite(url);
    if (!scrapedData || scrapedData.length === 0) {
      return NextResponse.json({ message: "No content with images found for analysis." }, { status: 400 });
    }

    // Extract CRO test ideas using Ollama
    const croTests = await extractCROIdeas(scrapedData);

    // Save results to Supabase
    const { error } = await supabase.from("cro_tests").insert(croTests.tests);
    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ message: "Failed to save data to database." }, { status: 500 });
    }

    return NextResponse.json({ message: "CRO tests saved!", tests: croTests.tests }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error processing request.", error: error.message }, { status: 500 });
  }
}