import React, { useEffect, useRef, useState } from 'react';
import { useInvestorStore } from '@/stores/useInvestorStore';
import { authenticateAdmin, getAdminToken } from '@/services/dataRoomCloudService';

const ADMIN_EMAIL = 'y.barberis@enr-courtage.fr';

/**
 * Synchronisation globale de la Data Room avec le stockage cloud partagé.
 *  - Charge la liste des documents depuis le serveur pour TOUT utilisateur connecté.
 *  - Rafraîchit au retour sur l'onglet (nouveaux documents publiés par l'admin).
 *  - Côté administrateur : confirmation du mot de passe si nécessaire, suivi du transfert initial
 *    des documents locaux vers le cloud et des enregistrements.
 */
export default function DataRoomCloudSync() {
  const currentInvestor = useInvestorStore((s) => s.currentInvestor);
  const cloud = useInvestorStore((s) => s.dataRoomCloud) || {};
  const loadDataRoomFromCloud = useInvestorStore((s) => s.loadDataRoomFromCloud);
  const pushDataRoomToCloud = useInvestorStore((s) => s._setDataRoomCloud && s.pushDataRoomToCloud);
  const setCloud = useInvestorStore((s) => s._setDataRoomCloud);

  const [authOpen, setAuthOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const lastLoadRef = useRef(0);

  const email = currentInvestor?.email?.trim().toLowerCase() || '';
  const isAdmin = email === ADMIN_EMAIL;

  // Chargement initial + à chaque changement d'utilisateur
  useEffect(() => {
    if (!email || !loadDataRoomFromCloud) return;
    lastLoadRef.current = Date.now();
    loadDataRoomFromCloud();
  }, [email, loadDataRoomFromCloud]);

  // Rafraîchissement au retour sur l'onglet (max toutes les 30 s)
  useEffect(() => {
    if (!email) return undefined;
    const onFocus = () => {
      if (document.visibilityState === 'hidden') return;
      if (Date.now() - lastLoadRef.current < 30000) return;
      lastLoadRef.current = Date.now();
      loadDataRoomFromCloud?.();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [email, loadDataRoomFromCloud]);

  // Demande explicite de confirmation admin (ex : avant un téléversement)
  useEffect(() => {
    const onRequest = () => {
      if (getAdminToken()) {
        window.dispatchEvent(new CustomEvent('enr-dataroom-auth-done', { detail: { success: true } }));
        return;
      }
      setAuthOpen(true);
    };
    window.addEventListener('enr-dataroom-auth-request', onRequest);
    return () => window.removeEventListener('enr-dataroom-auth-request', onRequest);
  }, []);

  // Le store signale qu'un jeton admin est requis (migration initiale / enregistrement)
  useEffect(() => {
    if (isAdmin && cloud.needsAuth) setAuthOpen(true);
  }, [isAdmin, cloud.needsAuth]);

  // Avertir avant de quitter si un enregistrement est en cours
  useEffect(() => {
    const busy = cloud.dirty || cloud.saving || cloud.migrating;
    if (!busy) return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = 'Enregistrement de la Data Room en cours…';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [cloud.dirty, cloud.saving, cloud.migrating]);

  const closeAuth = (success) => {
    setAuthOpen(false);
    setPassword('');
    setAuthError('');
    window.dispatchEvent(new CustomEvent('enr-dataroom-auth-done', { detail: { success } }));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthBusy(true);
    setAuthError('');
    try {
      await authenticateAdmin(ADMIN_EMAIL, password.trim());
      setCloud?.({ needsAuth: false, error: null });
      closeAuth(true);
      const st = useInvestorStore.getState().dataRoomCloud || {};
      if (!st.loaded) {
        await loadDataRoomFromCloud?.();
      } else if (st.dirty) {
        pushDataRoomToCloud?.();
      }
    } catch (err) {
      setAuthError(err?.message || 'Mot de passe incorrect.');
    } finally {
      setAuthBusy(false);
    }
  };

  if (!isAdmin) return null;

  const progress = cloud.progress;

  return (
    <>
      {(cloud.migrating || cloud.saving || (cloud.error && !authOpen)) && (
        <div
          style={{ zIndex: 99999 }}
          className="fixed bottom-4 right-4 max-w-sm rounded-xl shadow-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800"
        >
          {cloud.migrating && (
            <div>
              <div className="font-bold text-blue-700">Mise en ligne de la Data Room…</div>
              <div className="text-xs text-slate-600 mt-1">
                Transfert de vos documents vers le stockage cloud partagé
                {progress ? ` : ${progress.done} / ${progress.total}` : ''}. Merci de garder cette page ouverte.
              </div>
              {progress && progress.total > 0 && (
                <div className="mt-2 h-1.5 w-full rounded bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          )}
          {!cloud.migrating && cloud.saving && (
            <div className="text-slate-600">Enregistrement de la Data Room dans le cloud…</div>
          )}
          {!cloud.migrating && !cloud.saving && cloud.error && (
            <div>
              <div className="font-bold text-red-600">Data Room : synchronisation cloud en attente</div>
              <div className="text-xs text-slate-600 mt-1">{cloud.error}</div>
              <button
                type="button"
                className="mt-2 text-xs font-bold text-blue-700 underline"
                onClick={() => {
                  setCloud?.({ error: null });
                  const st = useInvestorStore.getState().dataRoomCloud || {};
                  if (!getAdminToken()) setAuthOpen(true);
                  else if (!st.loaded) loadDataRoomFromCloud?.();
                  else pushDataRoomToCloud?.();
                }}
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
      )}

      {authOpen && (
        <div style={{ zIndex: 100000 }} className="fixed inset-0 flex items-center justify-center bg-slate-900/60 p-4">
          <form onSubmit={handleAuthSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">Confirmation administrateur</h3>
            <p className="mt-2 text-sm text-slate-600">
              Pour publier ou modifier les documents de la Data Room sur le stockage cloud partagé (visible par tous les
              investisseurs, depuis n'importe quel poste), confirmez votre mot de passe administrateur.
            </p>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe administrateur"
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {authError && <div className="mt-2 text-xs font-semibold text-red-600">{authError}</div>}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCloud?.({ needsAuth: false });
                  closeAuth(false);
                }}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Plus tard
              </button>
              <button
                type="submit"
                disabled={authBusy || !password.trim()}
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50"
              >
                {authBusy ? 'Vérification…' : 'Confirmer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
