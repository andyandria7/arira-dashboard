"use client";

import { useState, useTransition } from "react";
import { setSubscriberStatus } from "@/lib/actions/admin-actions";

export function SubscriberToggle({ userId, initial }: { userId: string; initial: boolean }) {
  const [isOn, setIsOn] = useState(initial);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !isOn;
    setIsOn(next);
    startTransition(async () => {
      try {
        await setSubscriberStatus(userId, next);
      } catch {
        setIsOn(!next);
      }
    });
  }

  return (
    <div className="sub-cell">
      <button
        className={`switch${isOn ? " is-on" : ""}`}
        type="button"
        onClick={toggle}
        disabled={isPending}
        aria-label={isOn ? "Retirer le statut abonnée" : "Marquer comme abonnée"}
      />
      <span className={`sub-status${isOn ? " is-on" : ""}`}>{isOn ? "Abonnée" : "Non abonnée"}</span>
    </div>
  );
}
