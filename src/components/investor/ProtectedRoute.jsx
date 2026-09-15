import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useInvestorStore } from '@/stores/useInvestorStore';

export default function ProtectedRoute({ children, requireNda = true }) {
  const location = useLocation();
  const { currentInvestor } = useInvestorStore();

  // 1. Force logout of any legacy test accounts
  if (
    currentInvestor &&
    !currentInvestor.isAdmin &&
    currentInvestor.email !== 'y.barberis@enr-courtage.fr' &&
    (
      currentInvestor.id === 'INV-001' ||
      currentInvestor.id === 'INV-002' ||
      currentInvestor.id === 'INV-003' ||
      currentInvestor.email?.toLowerCase().includes('meridiam') ||
      currentInvestor.email?.toLowerCase().includes('omnes') ||
      currentInvestor.email?.toLowerCase().includes('demo') ||
      currentInvestor.email?.toLowerCase().includes('test')
    )
  ) {
    useInvestorStore.getState().logout();
    return <Navigate to="/investisseurs" replace />;
  }

  // 2. Not authenticated -> redirect to login
  if (!currentInvestor) {
    return <Navigate to="/investisseurs" state={{ from: location }} replace />;
  }

  // 2. Pending admin validation
  if (currentInvestor.status === 'pending') {
    return <Navigate to="/investisseurs" state={{ error: 'Compte en attente de validation' }} replace />;
  }

  // 3. NDA Required check
  if (requireNda && (!currentInvestor.ndaSignedAt || currentInvestor.status !== 'active')) {
    return <Navigate to="/investisseurs/nda" replace />;
  }

  return children;
}
