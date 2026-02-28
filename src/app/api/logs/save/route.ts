import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getAllowedEncodingDates } from "@/lib/challenge";
import { BADGE_DEFINITIONS } from "@/lib/badges"; // Assuming BADGE_DEFINITIONS is imported from here

import { updateBadgesPostSave } from "@/lib/badges";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
        }

        const body = await req.json();
        const { date, sets } = body;

        if (!date || !sets) {
            return NextResponse.json({ message: "Données manquantes" }, { status: 400 });
        }

        const allowedDates = getAllowedEncodingDates();
        if (!allowedDates.includes(date)) {
            return NextResponse.json({ message: "Date non autorisée" }, { status: 403 });
        }

        const userId = session.user.id;

        // Transaction: delete existing for this date and user, then create new
        await (prisma as any).$transaction([
            (prisma as any).exerciseSet.deleteMany({
                where: { userId, date }
            }),
            (prisma as any).exerciseSet.createMany({
                data: [
                    ...(sets.pushups || []).map((reps: number) => ({ userId, date, exercise: "PUSHUP", reps: Math.min(500, Math.max(0, Number(reps) || 0)) })),
                    ...(sets.pullups || []).map((reps: number) => ({ userId, date, exercise: "PULLUP", reps: Math.min(500, Math.max(0, Number(reps) || 0)) })),
                    ...(sets.squats || []).map((reps: number) => ({ userId, date, exercise: "SQUAT", reps: Math.min(500, Math.max(0, Number(reps) || 0)) })),
                ]
            })
        ]);

        // Trigger badge calculation
        await updateBadgesPostSave(userId);

        return NextResponse.json({ message: "Séries enregistrées ✅" });

    } catch (error) {
        console.error("Save Logs Error:", error);
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}
