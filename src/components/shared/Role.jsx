// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuthStore } from '@/store/auth';

export default function Guard({
  // s,
  children,
}) {
  // const location = useLocation();
  // const hasRole = useAuthStore((s) => s.hasRole);

  // if (!hasRole(roles)) {
  //   return <Navigate to="/app" replace state={{ from: location }} />;
  // }
  return <>{children}</>;
}
