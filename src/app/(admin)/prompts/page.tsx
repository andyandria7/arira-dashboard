import Link from "next/link";
import { getDashboardSnapshot } from "@/lib/data/dashboard";

export default async function PromptsPage() {
  const snapshot = await getDashboardSnapshot();
  const { completionRate, totalPending, activePromptsCount, topPrompts } = snapshot.prompts;

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="display">Prompts</h1>
          <p className="lede">Ce qui déclenche l&apos;écriture — et ce qui la bloque.</p>
        </div>
      </div>

      <section className="tiles">
        <div className="card tile">
          <div className="label">Taux de complétion</div>
          <div className="value-row">
            <span className="value num">{completionRate}%</span>
          </div>
        </div>
        <div className="card tile">
          <div className="label">En attente de réponse</div>
          <div className="value-row">
            <span className="value num">{totalPending}</span>
          </div>
        </div>
        <div className="card tile">
          <div className="label">Prompts actifs</div>
          <div className="value-row">
            <span className="value num">{activePromptsCount}</span>
          </div>
        </div>
      </section>

      <section className="card panel">
        <div className="panel-head">
          <div>
            <h2>Performance par prompt</h2>
            <span className="meta">Top 10 par nombre de réponses tranchées (répondu ou passé)</span>
          </div>
          <Link href="/prompts/all" className="btn-ghost">
            Voir tout ({activePromptsCount})
          </Link>
        </div>
        {topPrompts.length === 0 && <p className="lede">Pas encore assez de données.</p>}
        {topPrompts.map((p) => (
          <div className="prompt-row" key={p.content}>
            <div className="ptext">« {p.content} »</div>
            <div className="prompt-meta">
              <span className="num">{p.views.toLocaleString("fr-FR")} réponses</span>
              <div className="skip-track">
                <div className="skip-fill" style={{ width: `${p.skipPct}%` }} />
              </div>
              <span>{p.skipPct}% skip</span>
            </div>
          </div>
        ))}
      </section>

      <footer className="note">
        Le taux de skip exclut les prompts encore « en attente » (affichés mais sans réponse ni skip enregistré) — il
        ne compare que les réponses tranchées.
      </footer>
    </>
  );
}
