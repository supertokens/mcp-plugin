import { z } from "zod";

import { ToolContextSchema } from "./schemas";
import { ToolAnnotations } from "@modelcontextprotocol/sdk/types";

export type RecipeName =
  | "userroles"
  | "usermetadata"
  | "multitenancy"
  | "emailpassword"
  | "passwordless";

export interface Tool {
  name: string;
  annotations: ToolAnnotations;
  description: string;
  input: z.ZodObject<any, any, any>;
  handler: (
    input: any,
    context: ToolContext
  ) => Promise<string | Record<string, unknown>>;
  // Recipes that should be initialised when the tool is called
  recipes: RecipeName[];
}

export type ToolContext = z.infer<typeof ToolContextSchema>;
