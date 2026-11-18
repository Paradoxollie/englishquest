import Image from "next/image";
import Link from "next/link";
import { formatGold } from "@/lib/shop/format-gold";
import { wardrobeItemHref, type RewardPreview } from "@/lib/shop/reward-preview";
import styles from "./collection-progress.module.css";

export function CollectionGoal({ item, status }: { item: RewardPreview; status: string }) {
  return (
    <section className={`eq-card ${styles.goal}`} aria-labelledby="home-collection-goal">
      {item.image_url ? (
        <div className={styles.goalArt} data-type={item.item_type}>
          <Image src={item.image_url} alt="" fill sizes="96px" unoptimized={!item.image_url.startsWith("/")} />
        </div>
      ) : null}
      <div className={styles.goalCopy}>
        <span className="eq-caption">À collectionner</span>
        <h2 id="home-collection-goal" className="eq-h3">{item.name}</h2>
        <p>{formatGold(item.price_gold)} · Niveau {item.required_level}</p>
        <p className={styles.goalStatus}>{status}</p>
        <Link href={wardrobeItemHref(item.item_key)} className="eq-text-link">Voir cet objet</Link>
      </div>
    </section>
  );
}
