import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: { kindeAuth: string } } // Explicitly define context type
) {
  const { params } = context; // Destructure params from context
  const endpoint = await params.kindeAuth; // Await params before using

  return handleAuth(request, endpoint);
}