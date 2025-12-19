import { ReactNode } from "react";

export type LessonContent = {
    courseNumber: number;
    title: string;
    objective: string;
    description?: string;
    icon?: string;
    difficulty?: string;
    sections: LessonSection[];
};

export type LessonSection = {
    title: string;
    content: ReactNode;
};

// Helper component for placeholders
export const PlaceholderContent = () => (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
            <span className="text-4xl text-slate-400">🚧</span>
        </div>
        <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white text-outline">En cours de construction</h3>
            <p className="text-slate-300 max-w-md mx-auto">
                Nos rédacteurs pédagogiques travaillent actuellement sur cette leçon.
                Elle sera disponible très prochainement !
            </p>
        </div>
        <div className="comic-panel border-2 border-emerald-500/30 p-4 bg-emerald-950/20">
            <p className="text-emerald-400 text-sm font-bold">
                N'hésitez pas à continuer avec une autre leçon en attendant !
            </p>
        </div>
    </div>
);
