import Image from "next/image";
import Link from "next/link";
import styles from "./collection-progress.module.css";

export function CollectionInvitation() {
  return (
    <section className={`eq-container ${styles.invitationSection}`} aria-labelledby="home-collection-title">
      <div className={styles.invitation}>
        <div className={styles.invitationArt}>
          <Image src="/art/collection/couverture.webp" alt="Maya et Sam examinent la maquette de leur vaisseau à Londres."
            fill sizes="(max-width: 650px) 94vw, (max-width: 1150px) 44vw, 500px" />
        </div>
        <div className={styles.invitationCopy}>
          <h2 id="home-collection-title" className="eq-h2">Compose ta collection</h2>
          <p>Avec un compte, l’expérience des missions et des jeux te fait monter de niveau. Dépense ton or pour choisir tes portraits, tes décors et tes vaisseaux.</p>
          <Link className="eq-btn eq-btn-gold" href="/collection">Découvrir les albums</Link>
        </div>
      </div>
    </section>
  );
}
