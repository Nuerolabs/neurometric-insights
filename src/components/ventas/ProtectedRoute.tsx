import { Navigate } from 'react-router-dom';
import { useVentas } from '@/context/VentasContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useVentas();

  if (!isAuthenticated) {
    return <Navigate to="/ventas/login" replace />;
  }

  return <>{children}</>;
}
