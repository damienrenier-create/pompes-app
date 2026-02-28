import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Non autorisé" }, { status: 401 })
        }

        const { count, date } = await req.json()

        if (count === undefined || Number.isNaN(count) || count < 0) {
            return NextResponse.json({ message: "Nombre de pompes invalide" }, { status: 400 })
        }

        if (!date || typeof date !== "string") {
            return NextResponse.json({ message: "Date invalide" }, { status: 400 })
        }

        // Upsert semantic: Create if it doesn't exist, update if it does.
        const pushupLog = await prisma.pushupLog.upsert({
            where: {
                userId_date: {
                    userId: session.user.id,
                    date: date,
                }
            },
            update: {
                count: count,
            },
            create: {
                userId: session.user.id,
                date: date,
                count: count,
            }
        })

        return NextResponse.json({ log: pushupLog, message: "Pompes enregistrées pour aujourd'hui" }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { message: "Erreur lors de l'enregistrement des pompes" },
            { status: 500 }
        )
    }
}
