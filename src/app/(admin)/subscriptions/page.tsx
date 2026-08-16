import { getDashboardSnapshot } from "@/lib/data/dashboard";
import { SubscriberToggle } from "@/components/subscriber-toggle";

export default async function SubscriptionsPage() {
  const snapshot = await getDashboardSnapshot();
  const users = snapshot.users;
  const subscribers = users.filter((u) => u.is_subscriber);
  const pctOfCommunity = users.length > 0 ? Math.round((subscribers.length / users.length) * 1000) / 10 : 0;

  const sorted = [...users].sort((a, b) => Number(b.is_subscriber) - Number(a.is_subscriber));

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="display">Abonnements</h1>
          <p className="lede">Suivi manuel, en attendant l&apos;intégration d&apos;un vrai système de paiement dans l&apos;app.</p>
        </div>
      </div>

      <div className="banner">
        <span style={{ fontSize: 16, lineHeight: 1 }}>⚠</span>
        <div>
          <strong>Statut déclaratif, pas facturé</strong>
          <p>
            L&apos;app ne gère pas encore les paiements (Stripe / RevenueCat à venir). Cet onglet permet de marquer
            manuellement une utilisatrice comme abonnée pour test ou suivi, en attendant.
          </p>
        </div>
      </div>

      <section className="tiles">
        <div className="card tile">
          <div className="label">Abonnées marquées</div>
          <div className="value-row">
            <span className="value num">{subscribers.length}</span>
          </div>
        </div>
        <div className="card tile">
          <div className="label">Part de la communauté</div>
          <div className="value-row">
            <span className="value num">{pctOfCommunity}%</span>
          </div>
        </div>
        <div className="card tile">
          <div className="label">Total comptes</div>
          <div className="value-row">
            <span className="value num">{users.length}</span>
          </div>
        </div>
      </section>

      <section className="card panel">
        <div className="panel-head">
          <h2>Marquer des abonnées</h2>
          <span className="meta">Modifiable manuellement</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Utilisatrice</th>
                <th>Statut</th>
                <th>Inscrite depuis</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((u) => {
                const displayName = u.username ?? u.email ?? `Utilisatrice #${u.id.slice(0, 4)}`;
                return (
                  <tr key={u.id}>
                    <td className="user-cell">
                      <div className="u-avatar">{displayName.slice(0, 2).toUpperCase()}</div>
                      {displayName}
                    </td>
                    <td>
                      <SubscriberToggle userId={u.id} initial={u.is_subscriber} />
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="note">
        La logique réelle (webhook Stripe/RevenueCat) remplacera ce suivi manuel avec le système d&apos;abonnement de
        l&apos;app.
      </footer>
    </>
  );
}
