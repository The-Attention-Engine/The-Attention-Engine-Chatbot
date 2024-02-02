import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from "ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

const buildGoogleGenAIPrompt = (messages: Message[]) => ({
  contents: messages
    .filter(
      (message) => message.role === "user" || message.role === "assistant"
    )
    .map((message) => ({
      role: message.role === "user" ? "user" : "model",
      parts: [{ text: message.content }],
    })),
});

// export const runtime = "edge";

// const instructionMessage: Message[] = {
//   role: "assistant",
//   content:
//     "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations.",
// };

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const { messages } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!genAI.apiKey) {
      return new NextResponse("Google Gemini API Key not configured.", {
        status: 500,
      });
    }

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    // const prompt = messages;
    // prompt.contents.push({
    //   role: "user",
    //   parts: [
    //     {
    //       text: "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations.",
    //     },
    //   ],
    // });

    const geminiStream = await genAI
      .getGenerativeModel({ model: "gemini-pro" })
      .generateContentStream(buildGoogleGenAIPrompt(messages));

    const stream = GoogleGenerativeAIStream(geminiStream);

    return new StreamingTextResponse(stream);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
