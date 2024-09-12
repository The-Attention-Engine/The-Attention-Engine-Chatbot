import Replicate from "replicate";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || "",
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt, amount = 1, resolution = "512x512" } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    if (!amount) {
      return new NextResponse("Amount is required", { status: 400 });
    }

    if (!resolution) {
      return new NextResponse("Resolution is required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse(
        "Free trial has expired. Please upgrade to pro.",
        { status: 403 }
      );
    }

    const response = await replicate.run(
      "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
      {
        input: {
          prompt,
        },
      }
    );

    if (!isPro) {
      await incrementApiLimit();
    }
    console.log("response: ", response);

    return NextResponse.json(response);
  } catch (error) {
    return new NextResponse(`Internal Error ${error}`, { status: 500 });
  }
}

// import { auth } from "@clerk/nextjs";
// import { NextResponse } from "next/server";
// import { Configuration, OpenAIApi } from "openai-edge";

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const openai = new OpenAIApi(configuration);

// export const runtime = "edge";

// export async function POST(req: Request) {
//   try {
//     const { userId } = auth();
//     const body = await req.json();
//     const { prompt, amount = 1, resolution = "512x512" } = body;

//     if (!userId) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     if (!configuration.apiKey) {
//       return new NextResponse("OpenAI API Key not configured.", {
//         status: 500,
//       });
//     }

//     if (!prompt) {
//       return new NextResponse("Prompt is required", { status: 400 });
//     }

//     if (!amount) {
//       return new NextResponse("Amount is required", { status: 400 });
//     }

//     if (!resolution) {
//       return new NextResponse("Resolution is required", { status: 400 });
//     }

// const freeTrial = await checkApiLimit();
// const isPro = await checkSubscription();

// if (!freeTrial && !isPro) {
//   return new NextResponse(
//     "Free trial has expired. Please upgrade to pro.",
//     { status: 403 }
//   );
// }

//     const response = await openai.createImage({
//       prompt,
//       n: parseInt(amount, 10),
//       size: resolution,
//     });
//
// if (!isPro) {
//   await incrementApiLimit();
// }
//
//     return NextResponse.json(response.url);
//   } catch (error) {
//     return new NextResponse("Internal Error", { status: 500 });
//   }
// }
