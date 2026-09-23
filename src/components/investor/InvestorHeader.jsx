import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  ShieldCheck,
  ArrowLeft,
  Menu,
  FileSignature,
  Bell,
  CheckCircle2,
  Lock,
  User,
  ExternalLink,
} from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';
import EnrCourtageLogo from './EnrCourtageLogo';

export default function InvestorHeader({
  onToggleMobileMenu = null,
  onOpenAdmin = null,
  onOpenNda = null,
  showBackToDashboard = false,
  pageTitle = null,
  pageTitleBadge = null,
  activeView = 'investor', // 'investor' | 'admin'
  onSwitchView = null,
  onNavigateNotif = null,
}) {
  const navigate = useNavigate();
  const { currentInvestor, logout, investors, offers, notifications, markNotificationsAsRead, messages } = useInvestorStore();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const isAdmin = currentInvestor?.email?.trim().toLowerCase() === 'y.barberis@enr-courtage.fr';

  // Dynamic count of unanswered messages
  // For Admin: Count of unique investor conversations where the LAST message was sent by the investor
  // For Investor: Count of messages sent by admin that are unread
  const unansweredMessagesCount = React.useMemo(() => {
    if (isAdmin) {
      const messagesByInvestor = {};
      (messages || []).forEach((m) => {
        const email = (m.investorEmail || '').trim().toLowerCase();
        if (!email) return;
        if (!messagesByInvestor[email]) {
          messagesByInvestor[email] = [];
        }
        messagesByInvestor[email].push(m);
      });

      let count = 0;
      Object.entries(messagesByInvestor).forEach(([email, msgs]) => {
        const sorted = [...msgs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const lastMsg = sorted[sorted.length - 1];
        if (lastMsg && lastMsg.from === 'investor') {
          count++;
        }
      });
      return count;
    } else {
      const myEmail = (currentInvestor?.email || '').trim().toLowerCase();
      const myMessages = (messages || []).filter(
        (m) => (m.investorEmail || '').trim().toLowerCase() === myEmail
      );
      const sorted = [...myMessages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const lastMsg = sorted[sorted.length - 1];
      return lastMsg && lastMsg.from === 'admin' ? 1 : 0;
    }
  }, [messages, isAdmin, currentInvestor]);

  const userTarget = isAdmin ? 'admin' : (currentInvestor?.email || '').trim().toLowerCase();
  const userNotifications = (notifications || []).filter((n) => {
    if (isAdmin) {
      return n.target === 'admin';
    }
    return n.target && n.target.toLowerCase() === userTarget;
  });
  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const handleToggleNotif = () => {
    const nextState = !isNotifOpen;
    setIsNotifOpen(nextState);
    if (!isNotifOpen && unreadCount > 0) {
      markNotificationsAsRead(isAdmin ? 'admin' : userTarget);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/investisseurs/login');
  };

  const userInitials = currentInvestor?.name
    ? currentInvestor.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'JD';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3 shadow-xs transition-all duration-200 no-print">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Left Side: Official Logo */}
        <div className="flex items-center gap-4">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {showBackToDashboard ? (
            <button
              onClick={() => navigate('/investisseurs/dashboard')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition mr-2 cursor-pointer shadow-2xs"
              title="Retour aux Portefeuilles"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>
          ) : (
            <EnrCourtageLogo onClick={() => navigate('/investisseurs/dashboard')} />
          )}

          {pageTitle && (
            <div className="flex items-center gap-2 pl-1">
              <span className="text-xs sm:text-sm font-black text-[#0b192c] tracking-tight">{pageTitle}</span>
              {pageTitleBadge && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  {pageTitleBadge}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Center: Navigation Switcher (Admin Only) */}
        {isAdmin && (
          <div className="hidden md:flex items-center">
            <button
              onClick={() => {
                if (activeView === 'admin') {
                  if (onSwitchView) onSwitchView('investor');
                  else navigate('/investisseurs/dashboard');
                } else {
                  if (onSwitchView) onSwitchView('admin');
                  else if (onOpenAdmin) onOpenAdmin();
                  else navigate('/investisseurs/admin');
                }
              }}
              className="px-3.5 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>{activeView === 'admin' ? 'Retour aux Portefeuilles' : 'Console Administrateur'}</span>
              {unansweredMessagesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-black animate-pulse">
                  {unansweredMessagesCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Right Side: Profile Card, Notification Bell & Logout */}
        <div className="flex items-center gap-3">
          {currentInvestor && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs shrink-0 min-w-[190px] sm:min-w-[240px]">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                {currentInvestor?.avatar ? (
                  <img src={currentInvestor.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  userInitials
                )}
              </div>
              <div className="text-left leading-tight hidden sm:block min-w-0 flex-1">
                <div className="text-xs font-black text-slate-900 whitespace-nowrap">
                  {currentInvestor.name || 'Investisseur'}
                </div>
                <div className="text-[11px] text-slate-500 font-semibold whitespace-nowrap">
                  {currentInvestor.company || 'Partenaire M&A'}
                </div>
              </div>

              {onOpenNda && (
                <button
                  onClick={onOpenNda}
                  className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300 transition cursor-pointer ml-auto shrink-0"
                  title="Consulter et imprimer le NDA signé"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span>NDA Actif</span>
                </button>
              )}
            </div>
          )}

          {/* Dynamic Notification Bell */}
          <div className="relative">
            <button
              onClick={handleToggleNotif}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              title={unreadCount > 0 ? `${unreadCount} notification(s) non lue(s)` : 'Notifications M&A'}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </>
              )}
            </button>

            {/* Floating Notification Popover */}
            {isNotifOpen && (
              <div className="absolute top-12 right-0 z-50 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                      Notifications M&A
                    </span>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                    {userNotifications.length} reçue{userNotifications.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-0.5">
                  {userNotifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      Aucune nouvelle notification pour le moment.
                    </div>
                  ) : (
                    userNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          setIsNotifOpen(false);
                          if (onNavigateNotif) {
                            onNavigateNotif(notif);
                          }
                        }}
                        className={`p-3 rounded-xl border text-xs transition-all cursor-pointer hover:scale-[1.01] hover:shadow-xs active:scale-[0.99] ${
                          notif.type === 'offer' || notif.type === 'counter_offer'
                            ? 'bg-amber-50/60 border-amber-200 text-amber-950 hover:bg-amber-100/70'
                            : notif.type === 'offer_accepted'
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950 hover:bg-emerald-100/70'
                            : notif.type === 'registration_request'
                            ? 'bg-purple-50/60 border-purple-200 text-purple-950 hover:bg-purple-100/70'
                            : 'bg-blue-50/50 border-blue-200 text-blue-950 hover:bg-blue-100/70'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-bold text-xs leading-snug">{notif.title}</span>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                            {notif.createdAt
                              ? new Date(notif.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{notif.message}</p>
                        <span className="text-[10px] font-bold text-blue-600 hover:underline mt-1.5 inline-block">
                          Ouvrir l'échange →
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-200 cursor-pointer"
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
