import { getDashboardSnapshot } from "@/lib/data/dashboard";

export default async function GamificationPage() {
  const snapshot = await getDashboardSnapshot();
  const { badgeStats, streakBuckets, leaderboard, maxStreak, avgBadgesUnlocked } = snapshot.gamification;

  const maxBucket = Math.max(...streakBuckets.map((b) => b.count), 1);
  const mostUnlocked = badgeStats[0];
  const leastUnlocked = [...badgeStats].filter((b) => b.unlockedCount > 0).pop() ?? badgeStats[badgeStats.length - 1];

  const catClass = (cat: string) => (cat === "Découverte" ? "decouverte" : cat.toLowerCase());
  const catColor: Record<string, string> = {
    Progression: "var(--e-surprise)",
    "Découverte": "var(--e-peur)",
    Gratitude: "var(--warning)",
    Croissance: "var(--positive)",
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="display">Gamification</h1>
          <p className="lede">Progression, badges et régularité d&apos;écriture.</p>
        </div>
      </div>

      <section className="tiles">
        <div className="card tile">
          <div className="label">Streak record</div>
          <div className="value-row">
            <span className="value num">
              {maxStreak}
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-faint)" }}>&nbsp;j</span>
            </span>
          </div>
        </div>
        <div className="card tile">
          <div className="label">Badge le + débloqué</div>
          <div className="value-row">
            <span className="value" style={{ fontSize: 16 }}>{mostUnlocked?.name ?? "—"}</span>
          </div>
        </div>
        <div className="card tile">
          <div className="label">Badge le + rare</div>
          <div className="value-row">
            <span className="value" style={{ fontSize: 16 }}>{leastUnlocked?.name ?? "—"}</span>
          </div>
        </div>
        <div className="card tile">
          <div className="label">Badges débloqués / user</div>
          <div className="value-row">
            <span className="value num">{avgBadgesUnlocked.toFixed(1).replace(".", ",")}</span>
          </div>
        </div>
      </section>

      <section className="grid-2">
        <div className="card panel">
          <div className="panel-head">
            <h2>Distribution des streaks actuels</h2>
            <span className="meta">Nombre d&apos;utilisatrices</span>
          </div>
          <div className="histogram">
            {streakBuckets.map((b) => (
              <div className="col" key={b.label}>
                <span className="col-value num">{b.count}</span>
                <div
                  className={`bar${b.count === maxBucket && b.count > 0 ? " peak" : ""}`}
                  style={{ height: `${Math.max((b.count / maxBucket) * 100, b.count > 0 ? 4 : 0)}%` }}
                />
                <span className="col-label">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card panel">
          <div className="panel-head">
            <h2>Classement des séries</h2>
            <span className="meta">Streak actif</span>
          </div>
          {leaderboard.map((row, i) => (
            <div className={`rank-row${i < 3 ? " top" : ""}`} key={row.userId}>
              <span className="rank-num">{i + 1}</span>
              <span className="rank-name">{row.username}</span>
              <span className="rank-meta num">{row.streak} j</span>
            </div>
          ))}
          {leaderboard.length === 0 && <p className="lede">Aucun streak actif pour le moment.</p>}
        </div>
      </section>

      <section className="card panel">
        <div className="panel-head">
          <h2>Catalogue des badges</h2>
          <span className="meta">{badgeStats.length} badges · taux de déblocage global</span>
        </div>
        {badgeStats.map((b) => (
          <div className="badge-list-row" key={b.id}>
            <div>
              <div className="bname">{b.name}</div>
              <div className={`bcat ${catClass(b.category)}`} style={{ color: catColor[b.category] }}>
                {b.category}
              </div>
            </div>
            <div className="btrack">
              <div className="bfill" style={{ width: `${b.unlockedPct}%` }} />
            </div>
            <div className="bpct num">{b.unlockedPct}%</div>
          </div>
        ))}
      </section>
    </>
  );
}
