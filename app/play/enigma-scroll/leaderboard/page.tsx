import { EnigmaScrollLeaderboard } from "../leaderboard";
import Link from "next/link";
import { BookOpenIcon } from "@/components/ui/game-icons";
import { motion } from "framer-motion";

export default function EnigmaScrollLeaderboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 comic-dot-pattern p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="comic-panel-dark p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 50%, rgba(236, 72, 153, 0.2) 100%)",
          }}
        >
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                className="comic-panel bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 border-4 border-black p-4 relative overflow-hidden"
                whileHover={{ scale: 1.1, rotate: 5 }}
                style={{
                  boxShadow: "0 6px 0 0 #000, 0 0 25px rgba(139, 92, 246, 0.6), inset 0 2px 4px rgba(0,0,0,0.2)",
                }}
              >
                <BookOpenIcon className="w-8 h-8 md:w-10 md:h-10 text-white relative z-10" />
              </motion.div>
              <div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 text-outline" style={{
                  textShadow: "0 0 10px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3), 0 4px 8px rgba(0,0,0,0.8), 2px 2px 0 rgba(0,0,0,1)",
                }}>
                  Enigma Scroll - Classement
                </h1>
                <p className="text-slate-200 text-lg font-semibold text-outline">
                  Découvrez les meilleurs joueurs par difficulté!
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/play/enigma-scroll"
                className="comic-button bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white px-6 py-3 font-extrabold hover:from-slate-600 hover:to-slate-700 text-outline border-4 border-black"
                style={{
                  boxShadow: "0 5px 0 0 #000, 0 8px 16px rgba(0,0,0,0.4)",
                  textShadow: "0 0 4px rgba(0,0,0,0.8), 1px 1px 0 rgba(0,0,0,1)",
                }}
              >
                ← Retour au jeu
              </Link>
              <Link
                href="/play"
                className="comic-button bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white px-6 py-3 font-extrabold hover:from-slate-600 hover:to-slate-700 text-outline border-4 border-black"
                style={{
                  boxShadow: "0 5px 0 0 #000, 0 8px 16px rgba(0,0,0,0.4)",
                  textShadow: "0 0 4px rgba(0,0,0,0.8), 1px 1px 0 rgba(0,0,0,1)",
                }}
              >
                Tous les jeux
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <EnigmaScrollLeaderboard />
        </motion.div>
      </div>
    </div>
  );
}

