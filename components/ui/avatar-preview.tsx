/**
 * Avatar Preview Component - Affiche un avatar en format portrait uniforme
 * Utilisé partout dans l'application (boutique, profil, admin, etc.)
 */

interface AvatarPreviewProps {
  imageUrl?: string | null;
  colorTheme?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function AvatarPreview({
  imageUrl,
  colorTheme,
  name,
  size = "md",
  className = "",
}: AvatarPreviewProps) {
  const sizeClasses = {
    sm: "w-16 h-24", // Format portrait 2:3
    md: "w-24 h-36",
    lg: "w-32 h-48",
    xl: "w-48 h-72",
  };

  const getItemColor = (theme: string | null) => {
    const colors: Record<string, string> = {
      emerald: "bg-emerald-500",
      red: "bg-red-500",
      blue: "bg-blue-500",
      purple: "bg-purple-500",
      green: "bg-green-500",
      gold: "bg-yellow-500",
      dark: "bg-slate-800",
      slate: "bg-slate-600",
      cyan: "bg-cyan-500",
    };
    return colors[theme || "slate"] || "bg-slate-500";
  };

  return (
    <div
      className={`rounded-lg border-2 border-black overflow-hidden bg-slate-900 ${sizeClasses[size]} ${className}`}
      style={{ aspectRatio: "2/3" }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name || "Avatar"}
          className="w-full h-full object-cover"
        />
      ) : colorTheme ? (
        <div className={`w-full h-full ${getItemColor(colorTheme)}`} />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-950/30 to-emerald-900/30">
          {name && (
            <span className="text-2xl font-bold text-white text-outline">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

