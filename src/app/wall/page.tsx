import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import WallClient from "./WallClient";

export const metadata = {
    title: "Le Mur - Pompes entre potes",
    description: "Espace d'expression libre",
};

export default async function WallPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login");
    }

    const nickname = (session.user as any).nickname;
    const isConfigured = !!process.env.WALL_ENDPOINT_URL && !!process.env.WALL_WRITE_TOKEN;

    return (
        <div className="min-h-screen bg-gray-50 pb-24 safe-area-pb lg:pb-8">
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Le Mur 💬</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Espace d'expression libre. Partage tes impressions, tes coups de gueule ou tes victoires !
                    </p>
                </div>

                {!isConfigured ? (
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-orange-700 font-bold">
                                    Configuration manquante
                                </p>
                                <p className="text-xs text-orange-600 mt-1">
                                    Le endpoint Google Apps Script n'est pas configuré. Veuillez définir `WALL_ENDPOINT_URL` et `WALL_WRITE_TOKEN` dans les variables d'environnement.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <WallClient nickname={nickname} />
                )}
            </main>
        </div>
    );
}
