export default function QuestLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-11 w-11 animate-spin rounded-full border-4 border-solid border-[#c42b27] border-r-transparent" />
        <p className="font-semibold tracking-tight text-[#141824]">Chargement de l&apos;aventure...</p>
      </div>
    </div>
  );
}

