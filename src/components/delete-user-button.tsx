"use client";

import { useState, useTransition } from "react";
import { deleteUserAccount } from "@/lib/actions/admin-actions";

const CONFIRM_WORD = "SUPPRIMER";

export function DeleteUserButton({ userId, displayName }: { userId: string; displayName: string }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function close() {
    setOpen(false);
    setConfirmText("");
    setError(null);
  }

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteUserAccount(userId);
        close();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Échec de la suppression.");
      }
    });
  }

  return (
    <>
      <button className="btn-danger" type="button" onClick={() => setOpen(true)}>
        Supprimer
      </button>

      {open && (
        <div className={`modal-overlay${open ? " is-open" : ""}`} onClick={(e) => e.target === e.currentTarget && close()}>
          <div className="modal">
            <div className="modal-icon">⚠</div>
            <h3>Supprimer ce compte ?</h3>
            <p>
              Le compte de <span className="target-name">{displayName}</span> et toutes ses données (entrées de
              journal, photos, badges) seront supprimés définitivement. Cette action est irréversible.
            </p>
            <div className="modal-confirm-field">
              <label htmlFor="delete-confirm-input">Tape {CONFIRM_WORD} pour confirmer</label>
              <input
                id="delete-confirm-input"
                type="text"
                autoComplete="off"
                placeholder={CONFIRM_WORD}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
              />
            </div>
            {error && <p className="auth-error" style={{ marginTop: 10 }}>{error}</p>}
            <div className="modal-actions">
              <button className="btn-ghost" type="button" onClick={close} disabled={isPending}>
                Annuler
              </button>
              <button
                className="btn-danger"
                type="button"
                style={{
                  background: "var(--critical)",
                  color: "#fff",
                  opacity: confirmText.trim().toUpperCase() === CONFIRM_WORD && !isPending ? 1 : 0.5,
                  pointerEvents: confirmText.trim().toUpperCase() === CONFIRM_WORD && !isPending ? "auto" : "none",
                }}
                onClick={handleConfirm}
              >
                {isPending ? "Suppression…" : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
