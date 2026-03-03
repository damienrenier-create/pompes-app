import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import WallClient from "./WallClient";
import GazetteXP from "./GazetteXP";

export const metadata = {
    title: "Le Mur - Pompes entre potes",
    description: "Espace d'expression libre",
};

export default async function WallPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login");
    }

    const nickname = session.user.name || "Soldat";
    return (
        <div className="min-h-screen bg-gray-50 pb-24 safe-area-pb lg:pb-8">
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Le Mur 💬</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Espace d'expression libre. Partage tes impressions, tes coups de gueule ou tes victoires !
                    </p>
                </div>

                <WallClient nickname={nickname} />
                <GazetteXP />
            </main>
        </div>
    );
}
