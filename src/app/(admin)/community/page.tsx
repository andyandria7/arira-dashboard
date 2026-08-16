import { getDashboardSnapshot } from "@/lib/data/dashboard";

export default async function CommunityPage() {
  const snapshot = await getDashboardSnapshot();
  const { tagDistribution, personneDistribution, lieuDistribution, photoRatio, photosPerEntry } = snapshot.community;

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="display">Communauté</h1>
          <p className="lede">Tags, lieux et usage des photos · 30 derniers jours.</p>
        </div>
      </div>

      <section className="grid-2">
        <div className="card panel">
          <div className="panel-head">
            <h2>Tags utilisés</h2>
            <span className="meta">Sur les entrées taguées</span>
          </div>
          {tagDistribution.map((t) => (
            <div className="bar-item" key={t.label}>
              <span>{t.label}</span>
              <div className="bt">
                <div className="bf" style={{ width: `${t.pct}%` }} />
              </div>
              <span className="n num">{t.pct}%</span>
            </div>
          ))}
        </div>

        <div className="card panel">
          <div className="panel-head">
            <h2>Photos et lieux</h2>
            <span className="meta">Sur l&apos;ensemble des entrées</span>
          </div>
          <div className="tiles" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 18 }}>
            <div className="card tile" style={{ boxShadow: "none", borderColor: "var(--border-soft)" }}>
              <div className="label">Entrées avec photo</div>
              <div className="value-row">
                <span className="value num">{photoRatio}%</span>
              </div>
            </div>
            <div className="card tile" style={{ boxShadow: "none", borderColor: "var(--border-soft)" }}>
              <div className="label">Photos / entrée</div>
              <div className="value-row">
                <span className="value num">{photosPerEntry.toFixed(1).replace(".", ",")}</span>
              </div>
            </div>
          </div>
          {lieuDistribution.map((l) => (
            <div className="bar-item" key={l.label}>
              <span>{l.label}</span>
              <div className="bt">
                <div className="bf" style={{ width: `${l.pct}%` }} />
              </div>
              <span className="n num">{l.pct}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card panel">
        <div className="panel-head">
          <h2>Personnes</h2>
          <span className="meta">Contexte social des entrées taguées</span>
        </div>
        {personneDistribution.map((p) => (
          <div className="bar-item" key={p.label}>
            <span>{p.label}</span>
            <div className="bt">
              <div className="bf" style={{ width: `${p.pct}%` }} />
            </div>
            <span className="n num">{p.pct}%</span>
          </div>
        ))}
      </section>
    </>
  );
}
