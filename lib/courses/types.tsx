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
    <div className="min-h-[320px] flex flex-col items-center justify-center p-8 text-center space-y-5">
        <div className="eq-inset w-16 h-16 rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-[var(--gold)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 6v6l4 2" />
                <circle cx="12" cy="12" r="9" />
            </svg>
        </div>
        <div className="space-y-2">
            <h3 className="eq-h3">En cours de préparation</h3>
            <p className="eq-muted max-w-md mx-auto">
                Cette leçon sera complétée très prochainement.
            </p>
        </div>
        <div className="eq-inset border-emerald-500/35 px-4 py-3">
            <p className="text-[var(--mint)] text-sm font-semibold">
                Continue avec une autre leçon en attendant.
            </p>
        </div>
    </div>
);
