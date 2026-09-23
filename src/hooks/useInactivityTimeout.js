import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvestorStore } from '@/stores/useInvestorStore';

const INACTIVITY_LIMIT_MS = 60 * 60 * 1000; // 60 minutes

/**
 * Hook surveillant l'inactivité de l'utilisateur sur l'espace investisseur.
 * Déconnecte automatiquement la session après 60 minutes sans interaction,
 * conformément aux exigences réglementaires et secret d'affaires.
 */
export function useInactivityTimeout() {
  const navigate = useNavigate();
  const { currentInvestor, logout, logSecurityEvent } = useInvestorStore();
  const timerRef = useRef(null);

  const performLogout = useCallback(() => {
    if (!currentInvestor) return;

    if (logSecurityEvent) {
      logSecurityEvent({
        eventType: 'TIMEOUT_LOGOUT',
        targetResource: 'SESSION_INVESTISSEUR',
        details: `Déconnexion automatique après 60 minutes d'inactivité pour ${currentInvestor.email}`,
      });
    }

    if (logout) {
      logout();
    }

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(
        'enr_session_notice',
        "Votre session a été fermée automatiquement après 60 minutes d'inactivité par mesure de sécurité (conformité RGPD et secret des affaires)."
      );
    }

    navigate('/investisseurs', { replace: true });
  }, [currentInvestor, logout, logSecurityEvent, navigate]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('enr_last_activity', Date.now().toString());
    }

    timerRef.current = setTimeout(() => {
      performLogout();
    }, INACTIVITY_LIMIT_MS);
  }, [performLogout]);

  useEffect(() => {
    if (!currentInvestor) return;

    // Vérifier si la session précédente a déjà expiré
    if (typeof window !== 'undefined') {
      const savedTime = window.sessionStorage.getItem('enr_last_activity');
      if (savedTime) {
        const elapsed = Date.now() - parseInt(savedTime, 10);
        if (elapsed >= INACTIVITY_LIMIT_MS) {
          performLogout();
          return;
        }
      }
    }

    resetTimer();

    // Événements d'activité utilisateur
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach((evt) => {
      window.addEventListener(evt, handleActivity, { passive: true });
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((evt) => {
        window.removeEventListener(evt, handleActivity);
      });
    };
  }, [currentInvestor, resetTimer, performLogout]);
}
