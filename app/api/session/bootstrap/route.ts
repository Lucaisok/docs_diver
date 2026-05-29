import { createAnonymousSessionUser } from "@/src/server/auth/session-user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const returnTo = req.nextUrl.searchParams.get("returnTo") || "/dashboard";
    const safeReturnTo = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/dashboard";

    const { user, expiresAt } = await createAnonymousSessionUser();
    const response = NextResponse.redirect(new URL(safeReturnTo, req.url));

    response.cookies.set("docs_diver_session", user.id, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        expires: expiresAt,
        path: "/",
    });

    return response;
}
