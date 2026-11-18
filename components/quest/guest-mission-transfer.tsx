"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { transferGuestQuizzesAction } from "@/app/cours/actions";

export function GuestMissionTransfer() {
  const router = useRouter();
  const running = useRef(false);
  const [failed, setFailed] = useState(false);
  const transfer = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    try {
      if (!(await transferGuestQuizzesAction()).success) throw new Error();
      router.refresh();
    } catch {
      setFailed(true);
    } finally {
      running.current = false;
    }
  }, [router]);
  useEffect(() => { void transfer(); }, [transfer]);
  return (
    <div className="eq-container" role="status">
      {failed ? (
        <p>Les résultats sont encore sur cet appareil. <button type="button" className="eq-text-link" onClick={() => {
          setFailed(false);
          void transfer();
        }}>Réessayer le transfert</button></p>
      ) : <p>Transfert de tes missions sur ton compte…</p>}
    </div>
  );
}
