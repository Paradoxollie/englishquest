const names = { left: "gauche", right: "droite" } as const;
type Turn = keyof typeof names;

export function RouteBoard({ value, change }: { value: string; change: (value: string) => void }) {
  const turns = value.split(" ").filter((turn): turn is Turn => turn === "left" || turn === "right").slice(0, 2);
  const fork = turns[0] === "left" ? 96 : 224;
  const end = fork + (turns[1] === "left" ? -40 : 40);
  const route = "M160 91 L160 78" + (turns.length ? ` L${fork} 49` : "") + (turns.length === 2 ? ` L${end} 15` : "");
  return <div className="atlas-switches">
    <svg viewBox="0 0 320 105" aria-hidden="true" focusable="false">
      <path className="switch-rails" d="M160 91V78L96 49L56 15M96 49L136 15M160 78L224 49L184 15M224 49L264 15" />
      {[56, 136, 184, 264].map(x => <circle key={x} cx={x} cy="15" r="5" className="switch-stop" />)}
      <path className="switch-trail" d={route} />
      <circle cx={turns.length === 2 ? end : turns.length === 1 ? fork : 160} cy={[85, 49, 15][turns.length]} r="6" className="switch-position" />
    </svg>
    <p aria-live="polite">{turns.length ? `Ton trajet · ${turns.map(t => names[t]).join(" puis ")}` : "Premier embranchement"}{turns.length === 1 ? " · Encore un virage" : ""}</p>
    <div className="switch-controls">{(["left", "right"] as const).map(t =>
      <button type="button" key={t} disabled={turns.length === 2} onClick={() => change([...turns, t].join(" "))}>
        <span aria-hidden="true">{t === "left" ? "↖ " : "↗ "}</span>{t === "left" ? "Gauche" : "Droite"}
      </button>)}</div>
    {turns.length > 0 && <button className="switch-undo" type="button" onClick={() => change(turns.slice(0, -1).join(" "))}>Annuler le dernier virage</button>}
  </div>;
}
