import { Tool } from "../common/types";
export declare const Tools: Tool[];
export declare function callTool(
  tool: Tool,
  args: any
): Promise<
  | {
      isError: boolean;
      content: {
        type: "text";
        text: string;
      }[];
    }
  | {
      content: {
        type: "text";
        text: string;
      }[];
      isError?: undefined;
    }
>;
