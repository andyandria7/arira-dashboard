import Link from "next/link";
import { getDashboardSnapshot } from "@/lib/data/dashboard";

export default async function AllPromptsPage() {
  const snapshot = await getDashboardSnapshot();
  const { allPrompts, activePromptsCount } = snapshot.prompts;

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="display">Tous les prompts</h1>
          <p className="lede">{activePromptsCount} prompts actifs, triés par nombre de réponses tranchées.</p>
        </div>
        <Link href="/prompts" className="btn-ghost">
          ← Retour
        </Link>
      </div>

      <section className="card panel">
        <div className="panel-head">
          <h2>Catalogue complet</h2>
          <span className="meta">{allPrompts.length} prompts</span>
        </div>
        {allPrompts.length === 0 && <p className="lede">Aucun prompt actif.</p>}
        {allPrompts.map((p) => (
          <div className="prompt-row" key={p.content}>
            <div className="ptext">« {p.content} »</div>
            <div className="prompt-meta">
              {p.views > 0 ? (
                <>
                  <span className="num">{p.views.toLocaleString("fr-FR")} réponses</span>
                  <div className="skip-track">
                    <div className="skip-fill" style={{ width: `${p.skipPct}%` }} />
                  </div>
                  <span>{p.skipPct}% skip</span>
                </>
              ) : (
                <span className="lede">Jamais encore répondu ni passé</span>
              )}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
