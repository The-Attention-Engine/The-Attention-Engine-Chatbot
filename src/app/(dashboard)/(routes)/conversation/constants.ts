import * as z from "zod";

export const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Prompt is required.",
  }),
  model: z.string().min(1),
});

export const modelOptions = [
  {
    value: "gemini-pro",
    label: "Gemini Pro",
  },
  {
    value: "gpt-3.5-turbo",
    label: "GPT",
  },
  {
    value: "lama2-70b",
    label: "LAMA2-70B",
  },
  {
    value: "TAE",
    label: "The Attention Engine",
  },
];
