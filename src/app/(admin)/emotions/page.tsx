import { getDashboardSnapshot } from "@/lib/data/dashboard";

export default async function EmotionsPage() {
  const snapshot = await getDashboardSnapshot();
  const { distribution, customTop, correlationHeatmap } = snapshot.emotions;

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="display">Émotions</h1>
          <p className="lede">Ce que ressent la communauté · 30 derniers jours.</p>
        </div>
      </div>

      <section className="card panel">
        <div className="panel-head">
          <h2>Répartition des émotions</h2>
          <span className="meta">Part des entrées taguées d&apos;une émotion</span>
        </div>
        {distribution.length === 0 && <p className="lede">Pas encore de données sur cette période.</p>}
        {distribution.map((e) => (
          <div className="emo-row" key={e.label} style={{ gridTemplateColumns: "140px 1fr 70px" }}>
            <div className="emo-name">
              <span className="emo-dot" style={{ background: e.color }} />
              {e.label}
            </div>
            <div className="emo-track">
              <div className="emo-fill" style={{ width: `${e.pct}%`, background: e.color }} />
            </div>
            <div className="emo-pct num">
              {e.pct}% · {e.count}
            </div>
          </div>
        ))}
      </section>

      <section className="grid-2">
        <div className="card panel">
          <div className="panel-head">
            <h2>Corrélations</h2>
            <span className="meta">Émotion présente × contexte social (30j)</span>
          </div>
          {correlationHeatmap.length === 0 ? (
            <p className="lede">Pas encore assez de données pour croiser émotions et contexte social.</p>
          ) : (
            <div className="heatmap">
              <div className="heatmap-header">
                <span></span>
                {correlationHeatmap[0].cells.map((c) => (
                  <span key={c.personne}>{c.personne}</span>
                ))}
              </div>
              {correlationHeatmap.map((row) => (
                <div className="heatmap-row" key={row.label}>
                  <div className="rlabel">
                    <span className="emo-dot" style={{ background: row.color }} />
                    {row.label}
                  </div>
                  {row.cells.map((cell) => (
                    <div
                      className="heat-cell"
                      key={cell.personne}
                      style={{
                        background: `color-mix(in srgb, ${row.color} ${Math.max(cell.pct * 0.6, 6)}%, var(--surface-alt))`,
                      }}
                    >
                      {cell.pct}%
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card panel">
          <div className="panel-head">
            <h2>Émotions personnalisées</h2>
            <span className="meta">Créées par les utilisatrices</span>
          </div>
          {customTop.length === 0 && <p className="lede">Aucune émotion personnalisée utilisée sur cette période.</p>}
          {customTop.map((e) => (
            <div className="bar-item" key={e.label}>
              <span>{e.label}</span>
              <div className="bt">
                <div className="bf" style={{ width: `${e.pct}%` }} />
              </div>
              <span className="n num">{e.count}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
