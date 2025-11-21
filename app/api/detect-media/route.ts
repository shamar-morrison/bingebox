import { NextRequest, NextResponse } from "next/server";
import { detectMediaFromImage } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    // Expecting image to be a base64 string, potentially with data URI prefix
    // e.g., "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
    // We need to extract the base64 part and the mime type
    
    let mimeType = "image/png";
    let base64Data = image;

    if (image.includes("base64,")) {
      const [meta, data] = image.split("base64,");
      base64Data = data;
      const mimeMatch = meta.match(/:(.*?);/);
      if (mimeMatch) {
        mimeType = mimeMatch[1];
      }
    }

    const result = await detectMediaFromImage(base64Data, mimeType);

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error in detect-media route:", error);
    return NextResponse.json(
      { error: "Failed to process image detection" },
      { status: 500 }
    );
  }
}
