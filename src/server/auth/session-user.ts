import { prisma } from "@/src/lib/prisma";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "docs_diver_session";
const SESSION_DAYS = 7;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const createAnonymousUser = async () => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

    // Prisma requires a unique email, so anonymous users get a stable synthetic address.
    const user = await prisma.user.create({
        data: {
            name: "Anonymous user",
            isAnonymous: true,
            email: `${randomUUID()}@anonymous.docs-diver.local`,
            expiresAt,
        },
    });

    return { user, expiresAt };
};

export const getCurrentUserId = async () => {
    try {
        const cookieStore = await cookies();
        const existingUserId = cookieStore.get(SESSION_COOKIE_NAME)?.value?.trim();

        // Reuse the cookie when it looks valid; otherwise mint a fresh anonymous user.
        if (existingUserId && UUID_PATTERN.test(existingUserId)) {
            return existingUserId;
        }

        const { user, expiresAt } = await createAnonymousUser();

        try {
            // If writing the cookie fails, the request can still continue with the new user id.
            cookieStore.set(SESSION_COOKIE_NAME, user.id, {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                expires: expiresAt,
                path: "/",
            });
        } catch (cookieError) {
            console.error("Failed to persist session cookie", { cookieError, userId: user.id });
        }

        return user.id;
    } catch (error) {
        console.error("Failed to resolve current session user", { error });
        throw new Error("Unable to resolve the current user session.");
    }
};