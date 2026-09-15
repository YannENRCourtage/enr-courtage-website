import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useInvestorStore } from '@/stores/useInvestorStore';

export default function ProtectedRoute({ children, requireNda = true }) {
  const location = useLocation();
  const { currentInvestor } = useInvestorStore();

  // 1. Not authenticated -> redirect to login
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
