import Image from "next/image";
import railFork from "@/public/art/passage/rail-fork.webp";
import islandFork from "@/public/art/passage/island-fork.webp";
import railCar from "@/public/art/passage/rail-car.webp";
import mailBoat from "@/public/art/passage/mail-boat.webp";

const names = { left: "gauche", right: "droite" } as const;
type Turn = keyof typeof names;

export function RouteBoard({ value, change, vehicle }: { value: string; change: (value: string) => void; vehicle: "rail" | "boat" }) {
  const turns = value.split(" ").filter((turn): turn is Turn => turn === "left" || turn === "right").slice(0, 2);
  const train = vehicle === "rail";
  return <div className="atlas-journey">
    <div className="journey-window" data-first={turns[0]} data-count={turns.length}>
      <Image className="journey-land" src={train ? railFork : islandFork} alt={train ? "Deux voies se séparent sous les arbres. Chacune rejoint une arche éclairée." : "Le chenal se sépare autour d’une petite île entre deux bouées."} placeholder="blur" sizes="(max-width: 720px) 94vw, 680px" />
      <div className="journey-vehicle" key={value} data-last={turns.at(-1)} data-count={turns.length}>
        <Image src={train ? railCar : mailBoat} alt={train ? "Ton wagon" : "Ta barque"} sizes="125px" loading="eager" />
      </div>
      {(["left", "right"] as const).map(turn => <button className="journey-turn" type="button" data-turn={turn} key={turn} disabled={turns.length === 2}
        onClick={() => change([...turns, turn].join(" "))}><span aria-hidden="true">{turn === "left" ? "↖" : "↗"}</span> {turn === "left" ? "Gauche" : "Droite"}</button>)}
    </div>
    <div className="journey-log"><p role="status"><strong>{["Premier embranchement", "Deuxième embranchement", "Trajet tracé"][turns.length]}</strong>
      {turns.length > 0 && <span> · {turns.map(t => names[t]).join(" puis ")}</span>}</p>
      {turns.length > 0 && <button type="button" onClick={() => change(turns.slice(0, -1).join(" "))}>Annuler le dernier virage</button>}
    </div>
  </div>;
}
