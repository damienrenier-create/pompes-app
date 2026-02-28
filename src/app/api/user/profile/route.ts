import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ message: "Non autorisé" }, { status: 401 })
        }

        const { nickname } = await req.json()

        if (!nickname || nickname.trim().length === 0) {
            return NextResponse.json({ message: "Le surnom est requis." }, { status: 400 })
        }

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: { nickname: nickname.trim() },
            select: {
                id: true,
                nickname: true,
                email: true,
            }
        })

        return NextResponse.json({ user: updatedUser, message: "Profil mis à jour" })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { message: "Erreur lors de la mise à jour du profil" },
            { status: 500 }
        )
    }
}
