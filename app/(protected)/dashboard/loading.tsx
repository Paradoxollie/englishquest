export default function DashboardLoading() {
  return (
    <div className="eq-container flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-11 w-11 animate-spin rounded-full border-4 border-solid border-[var(--pro-primary)] border-r-transparent" />
        <p className="font-semibold tracking-tight">Chargement du dashboard...</p>
      </div>
    </div>
  );
}
