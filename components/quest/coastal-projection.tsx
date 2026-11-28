"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { landscapeSizes, type passagePicture } from "./passage-art";
import "./coastal-projection.css";

type Picture = ReturnType<typeof passagePicture>;

export function LanternShutter({ wide, detail }: { wide: Picture; detail: Picture }) {
  const [open, setOpen] = useState(false);
  const descriptionId = useId();
  const picture = open ? detail : wide;
  return <div className="coast-lantern" data-open={open}>
    <Image src={picture.src} alt={picture.alt} placeholder="blur" priority sizes={landscapeSizes} />
    <span id={descriptionId} role="status" className="coast-lantern-caption">{open && "C’est Sterne !"}</span>
    <button type="button" aria-expanded={open} aria-controls={descriptionId} onClick={() => setOpen(!open)}>
      <span className="coast-lantern-dial" aria-hidden="true" />
      {open ? "Rabattre le volet" : "Soulever le volet"}
    </button>
  </div>;
}

export function CoastalProjection({ episode }: { episode: number }) {
  switch (episode) {
    case 21:
      return <span aria-hidden="true" className="coast-beam" />;
    case 23:
      return <span aria-hidden="true" className="coast-plates">
        <span className="coast-boat-plate" /><span className="coast-moon-plate" />
      </span>;
    case 24:
      return <span aria-hidden="true" className="coast-signal"><i /><i /><i /><i /></span>;
    case 25:
      return <span aria-hidden="true" className="coast-homeward"><span className="coast-paper-boat" /></span>;
    default:
      return null;
  }
}
