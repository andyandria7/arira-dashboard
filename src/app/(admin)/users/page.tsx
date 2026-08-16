import { getDashboardSnapshot } from "@/lib/data/dashboard";
import { DeleteUserButton } from "@/components/delete-user-button";

export default async function UsersPage() {
  const snapshot = await getDashboardSnapshot();
  const users = [...snapshot.users].sort((a, b) => b.entriesCount - a.entriesCount);

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="display">Utilisateurs</h1>
          <p className="lede">{users.length} comptes au total.</p>
        </div>
      </div>

      <section className="card panel">
        <div className="panel-head">
          <h2>Tous les comptes</h2>
          <span className="meta">La suppression est définitive et irréversible</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Utilisatrice</th>
                <th>Email</th>
                <th>Entrées</th>
                <th>Streak</th>
                <th>Inscrite depuis</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const displayName = u.username ?? u.email ?? `Utilisatrice #${u.id.slice(0, 4)}`;
                return (
                  <tr key={u.id}>
                    <td className="user-cell">
                      <div className="u-avatar">{displayName.slice(0, 2).toUpperCase()}</div>
                      {displayName}
                      {u.is_admin && (
                        <span className="delta flat" style={{ marginLeft: 4 }}>
                          admin
                        </span>
                      )}
                    </td>
                    <td>{u.email ?? "—"}</td>
                    <td className="num">{u.entriesCount}</td>
                    <td>
                      {u.streak > 0 ? <span className="streak-chip">🔥 {u.streak} j</span> : <span className="lede">—</span>}
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td>
                      <div className="row-actions">
                        <DeleteUserButton userId={u.id} displayName={displayName} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="note">
        La suppression passe par la clé service_role côté serveur (Server Action), retire aussi les photos/avatars
        associés dans Storage.
      </footer>
    </>
  );
}
