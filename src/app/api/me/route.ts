import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ signedIn: false }, { status: 200 });
  return NextResponse.json({
    signedIn: true,
    email: user.email,
    credits: user.credits,
  });
}
