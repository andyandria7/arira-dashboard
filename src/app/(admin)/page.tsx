import { getDashboardSnapshot } from "@/lib/data/dashboard";
import { buildAreaPolygon, buildPolyline } from "@/lib/chart-utils";

export default async function OverviewPage() {
  const snapshot = await getDashboardSnapshot();
  const { overview, emotions, gamification, community } = snapshot;

  const rhythmCounts = overview.rhythm.map((r) => r.count);
  const line = buildPolyline(rhythmCounts, 600, 150, 10);
  const area = buildAreaPolygon(rhythmCounts, 600, 150, 10);
  const peakDay = overview.rhythm.reduce((max, r) => (r.count > max.count ? r : max), overview.rhythm[0]);
  const lastPoint = rhythmCounts[rhythmCounts.length - 1] ?? 0;
  const lastY = 150 - 10 - (rhythmCounts.length > 0
    ? ((lastPoint - Math.min(...rhythmCounts, 0)) / (Math.max(...rhythmCounts, 1) - Math.min(...rhythmCounts, 0) || 1)) * (150 - 20)
    : 0);

  const topEmotions = emotions.distribution.slice(0, 7);
  const topBadges = gamification.badgeStats.slice(0, 4);
  const topPersonnes = community.personneDistribution.slice(0, 4);

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="display">Vue d&apos;ensemble</h1>
          <p className="lede">
            État de la communauté Arira · {overview.totalEntries.toLocaleString("fr-FR")} entrées au total.
          </p>
        </div>
      </div>

      <section className="tiles">
        <div className="card tile">
          <div className="label">Entrées (30j)</div>
          <div className="value-row">
            <span className="value num">{overview.totalEntries30.toLocaleString("fr-FR")}</span>
          </div>
        </div>

        <div className="card tile">
          <div className="label">Utilisatrices actives (30j)</div>
          <div className="value-row">
            <span className="value num">{overview.activeUsers30.toLocaleString("fr-FR")}</span>
          </div>
        </div>

        <div className="card tile">
          <div className="label">Ratio positif moyen</div>
          <div className="value-row">
            <span className="value num">{overview.positiveRatio}%</span>
          </div>
        </div>

        <div className="card tile">
          <div className="label">Streak moyen</div>
          <div className="value-row">
            <span className="value num">
              {overview.avgStreak.toFixed(1).replace(".", ",")}
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-faint)" }}>&nbsp;j</span>
            </span>
          </div>
        </div>
      </section>

      <section className="grid-2">
        <div className="card panel">
          <div className="panel-head">
            <h2>Rythme d&apos;écriture</h2>
            <span className="meta">Entrées par jour · 30 derniers jours</span>
          </div>
          <div className="chart-wrap">
            <svg width="100%" height="150" viewBox="0 0 600 150" preserveAspectRatio="none">
              <line x1="0" y1="0" x2="600" y2="0" stroke="var(--border-soft)" strokeWidth="1" />
              <line x1="0" y1="50" x2="600" y2="50" stroke="var(--border-soft)" strokeWidth="1" />
              <line x1="0" y1="100" x2="600" y2="100" stroke="var(--border-soft)" strokeWidth="1" />
              <line x1="0" y1="149" x2="600" y2="149" stroke="var(--border-soft)" strokeWidth="1" />
              <polygon points={area} fill="var(--accent)" opacity="0.14" />
              <polyline
                points={line}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="600" cy={lastY} r="4.5" fill="var(--accent)" />
            </svg>
            <div className="rhythm-legend">
              <div className="lg">
                <span className="sw" style={{ background: "var(--accent)" }} />
                Entrées quotidiennes
              </div>
              {peakDay && peakDay.count > 0 && (
                <div className="lg">
                  Pic : {peakDay.count} entrées le{" "}
                  {new Date(peakDay.day).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card panel">
          <div className="panel-head">
            <h2>Émotions dominantes</h2>
            <span className="meta">Part des entrées (30j)</span>
          </div>
          {topEmotions.length === 0 && <p className="lede">Pas encore de données sur cette période.</p>}
          {topEmotions.map((e) => (
            <div className="emo-row" key={e.label}>
              <div className="emo-name">
                <span className="emo-dot" style={{ background: e.color }} />
                {e.label}
              </div>
              <div className="emo-track">
                <div className="emo-fill" style={{ width: `${e.pct}%`, background: e.color }} />
              </div>
              <div className="emo-pct num">{e.pct}%</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid-2">
        <div className="card panel">
          <div className="panel-head">
            <h2>Badges — taux de déblocage</h2>
            <span className="meta">% des utilisatrices ayant atteint le palier</span>
          </div>
          <div className="badges-grid">
            {topBadges.map((b) => (
              <div className="badge-card" key={b.id}>
                <div className={`cat ${b.category === "Découverte" ? "decouverte" : b.category.toLowerCase()}`}>
                  {b.category}
                </div>
                <div className="name">{b.name}</div>
                <div className="badge-track">
                  <div className="badge-fill" style={{ width: `${b.unlockedPct}%` }} />
                </div>
                <div className="foot">
                  <span className="num">{b.unlockedPct}%</span>
                  <span>{b.unlockedCount} users</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card panel">
          <div className="panel-head">
            <h2>Contexte social</h2>
            <span className="meta">Sur les entrées taguées (30j)</span>
          </div>
          <div className="social-cols">
            <div className="social-col">
              <h3>Personnes</h3>
              {topPersonnes.map((p) => (
                <div className="bar-item" key={p.label}>
                  <span>{p.label}</span>
                  <div className="bt">
                    <div className="bf" style={{ width: `${p.pct}%` }} />
                  </div>
                  <span className="n num">{p.pct}%</span>
                </div>
              ))}
            </div>
            <div className="social-col">
              <h3>Lieux fréquents</h3>
              {community.lieuDistribution.slice(0, 4).map((l) => (
                <div className="bar-item" key={l.label}>
                  <span>{l.label}</span>
                  <div className="bt">
                    <div className="bf" style={{ width: `${l.pct}%` }} />
                  </div>
                  <span className="n num">{l.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="card panel">
        <div className="panel-head">
          <h2>Utilisatrices les plus engagées</h2>
          <span className="meta">Streak actif le plus long</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Utilisatrice</th>
                <th>Streak</th>
              </tr>
            </thead>
            <tbody>
              {gamification.leaderboard.map((row) => (
                <tr key={row.userId}>
                  <td className="user-cell">
                    <div className="u-avatar">{row.username.slice(0, 2).toUpperCase()}</div>
                    {row.username}
                  </td>
                  <td>
                    <span className="streak-chip">🔥 {row.streak} j</span>
                  </td>
                </tr>
              ))}
              {gamification.leaderboard.length === 0 && (
                <tr>
                  <td colSpan={2} className="lede">
                    Aucun streak actif pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
