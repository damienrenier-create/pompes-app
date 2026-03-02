"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminClient({ user }: { user: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    const deleteSet = async (setId: string) => {
        if (!confirm("Supprimer cette série ? Action irréversible.")) return;
        setLoading(setId);
        try {
            const res = await fetch("/api/admin/delete-set", {
                method: "POST",
                body: JSON.stringify({ setId }),
            });
            if (res.ok) router.refresh();
            else alert("Erreur lors de la suppression");
        } catch (e) {
            alert("Erreur réseau");
        } finally {
            setLoading(null);
        }
    };

    const deleteFine = async (fineId: string) => {
        if (!confirm("Supprimer cette amende ?")) return;
        setLoading(fineId);
        try {
            const res = await fetch("/api/admin/delete-fine", {
                method: "POST",
                body: JSON.stringify({ fineId }),
            });
            if (res.ok) router.refresh();
            else alert("Erreur lors de la suppression");
        } catch (e) {
            alert("Erreur réseau");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 text-white p-6 rounded-3xl flex justify-between items-center shadow-xl">
                <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                        {user.nickname}
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                        ID: {user.id}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-slate-400">{user.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SETS */}
                <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-widest">
                            Séries Récentes (20)
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                        {user.sets.map((set: any) => (
                            <div key={set.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-gray-900">{set.reps}</span>
                                        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                                            {set.exercise}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">
                                        {set.date} • {new Date(set.createdAt).toLocaleTimeString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => deleteSet(set.id)}
                                    disabled={loading === set.id}
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                </button>
                            </div>
                        ))}
                        {user.sets.length === 0 && (
                            <p className="p-8 text-center text-gray-400 font-bold uppercase text-xs italic">
                                Aucune série trouvée.
                            </p>
                        )}
                    </div>
                </section>

                {/* FINES */}
                <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-widest">
                            Amendes Récentes (20)
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                        {user.fines.map((fine: any) => (
                            <div key={fine.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-red-600">{fine.amountEur}€</span>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${fine.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {fine.status === 'paid' ? 'Payée' : 'Due'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">
                                        Date: {fine.date}
                                    </p>
                                </div>
                                <button
                                    onClick={() => deleteFine(fine.id)}
                                    disabled={loading === fine.id}
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                </button>
                            </div>
                        ))}
                        {user.fines.length === 0 && (
                            <p className="p-8 text-center text-gray-400 font-bold uppercase text-xs italic">
                                Aucune amende trouvée.
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
