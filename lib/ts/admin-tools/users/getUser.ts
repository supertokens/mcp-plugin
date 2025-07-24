import { z } from "zod";
import supertokens from "supertokens-node";
import { Tool } from "../../common/types";
import { TenantIdSchema } from "../../common/schemas";
import { MCPServerError } from "../../common/error";
import { User } from "supertokens-node/lib/build/types";

const GetUserParametersSchema = z
  .object({
    email: z
      .string()
      .email()
      .optional()
      .describe(
        "The email used to identify the user. Omit the argument if you have specified the userId or the phoneNumber"
      ),
    phoneNumber: z
      .string()
      .optional()
      .describe(
        "The phone number used to identify the user. Omit the argument if you have specified the userId or the email"
      ),
    userId: z
      .string()
      .optional()
      .describe(
        "The user ID used to identify the user. Omit the argument if you have specified the email or the phoneNumber"
      ),
    tenantId: TenantIdSchema,
  })
  .refine((data) => {
    if (!data.email && !data.phoneNumber && !data.userId) {
      return false;
    }
    if (data.email && data.phoneNumber) {
      return false;
    }
    if (data.email && data.userId) {
      return false;
    }
    if (data.phoneNumber && data.userId) {
      return false;
    }
    return true;
  }, "You need to provide either email, phoneNumber, or userId as a filter");

type GetUserParameters = z.infer<typeof GetUserParametersSchema>;

async function getUserHandler({
  email,
  phoneNumber,
  userId,
  tenantId,
}: GetUserParameters) {
  let user: User | undefined;
  if (userId) {
    user = await supertokens.getUser(userId, {
      tenantId,
    });
  } else if (email || phoneNumber) {
    const users = await supertokens.listUsersByAccountInfo(tenantId, {
      email,
      phoneNumber,
    });
    user = users[0];
  } else {
    throw new MCPServerError(
      "Please provide either userId, email, or phoneNumber",
      "MCP_TOOL_CALL_ERROR"
    );
  }

  if (!user) {
    throw new MCPServerError("User not found", "MCP_TOOL_CALL_ERROR");
  }

  return user;
}

export const GetUserTool: Tool = {
  name: "get_user",
  annotations: {
    title: "Get user",
  },
  description: `
  Retrieves the details of a user from your SuperTokens integration.

  ## Input:
  - email: 
  ${GetUserParametersSchema._def.schema.shape.email.description}
  - phoneNumber: 
  ${GetUserParametersSchema._def.schema.shape.phoneNumber.description}
  - userId: 
  ${GetUserParametersSchema._def.schema.shape.userId.description}
  - tenantId 
  ${GetUserParametersSchema._def.schema.shape.tenantId.description}

  ## Return Value
  The user details object with the following fields:
    - id: string;
    The id of the user
    - timeJoined: number;
    The timestamp when the user was created
    - isPrimaryUser: boolean;
    Whether this account is the primary 
    - tenantIds: string[];
    The tenant IDs that the user belongs to
    - emails: string[];
    Emails associated with the user
    - phoneNumbers: string[];
    Phone numbers associated with the user
    - thirdParty: {
        id: string;
        userId: string;
    }[];
    Third party login information
    - webauthn: {
        credentialIds: string[];
    };
    Webauthn login information
    - loginMethods 
    All the login methods associated with this user
`,
  input: GetUserParametersSchema._def.schema,
  handler: getUserHandler,
  recipes: [],
};
