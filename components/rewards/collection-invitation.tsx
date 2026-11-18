import Image from "next/image";
import Link from "next/link";
import { CharacterFigure } from "@/components/rewards/character-art";
import { COLLECTION_ALBUMS } from "@/lib/shop/collection";
import styles from "./collection-progress.module.css";

const crew = ["basile", "k7", "silex"];

export function CollectionInvitation() {
  return (
    <section className={`eq-container ${styles.invitationSection}`} aria-labelledby="home-collection-title">
      <div className={styles.invitation}>
        <div className={styles.invitationArt} role="img" aria-label="Sur les quais de Londres, Basile le chien détective, K7 le robot et Silex le dragon de cuivre.">
          <Image src={COLLECTION_ALBUMS[0].cover} alt="" className={styles.invitationBackdrop}
            fill sizes="(max-width: 650px) 94vw, (max-width: 1150px) 44vw, 500px" />
          {crew.map(slug => (
            <span key={slug} className={styles.invitationFigure}>
              <CharacterFigure face={`/art/personnages/${slug}-visage.webp`} inCard />
            </span>
          ))}
        </div>
        <div className={styles.invitationCopy}>
          <h2 id="home-collection-title" className="eq-h2">Compose ta collection</h2>
          <p>Avec un compte, l’expérience des missions et des jeux te fait monter de niveau. Dépense ton or pour recruter les personnages qui t’accompagneront sur la carte, choisir un décor ou piloter un nouveau vaisseau.</p>
          <Link className="eq-btn eq-btn-gold" href="/collection#personnages">Rencontrer les personnages</Link>
        </div>
      </div>
    </section>
  );
}
