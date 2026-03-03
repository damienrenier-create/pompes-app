import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const endpoint = process.env.WALL_ENDPOINT_URL;
    if (!endpoint) {
        return NextResponse.json({ error: "WALL_ENDPOINT_URL is not configured" }, { status: 500 });
    }

    try {
        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            // Avoid aggressive caching for the feed
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(`Apps Script responded with status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Wall GET error:", error);
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    // Auth is mandatory
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).nickname) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const endpoint = process.env.WALL_ENDPOINT_URL;
    const writeToken = process.env.WALL_WRITE_TOKEN;

    if (!endpoint || !writeToken) {
        return NextResponse.json({ error: "Server wall configuration is missing" }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { message } = body;

        if (!message || typeof message !== "string" || message.trim().length === 0) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        if (message.length > 240) {
            return NextResponse.json({ error: "Message exceeds 240 characters" }, { status: 400 });
        }

        const payload = {
            token: writeToken,
            nickname: (session.user as any).nickname,
            message: message.trim(),
            createdAt: new Date().toISOString()
        };

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Apps Script responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status !== "success") {
            return NextResponse.json({ error: data.message || "Failed to post message" }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("Wall POST error:", error);
        return NextResponse.json({ error: "Failed to post message" }, { status: 500 });
    }
}
