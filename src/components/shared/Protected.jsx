// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuthStore } from '@/store/auth';
// import Loading from './Loading';
// import { useEffect, useState } from 'react';

export default function Protected({ children }) {
  // const location = useLocation();
  // const { hydrated, isAuthenticated, refresh, accessToken, expiresAt } = useAuthStore();
  // const [checking, setChecking] = useState(true);

  // useEffect(() => {
  //   const run = async () => {
  //     if (!hydrated) return;
  //     if (!isAuthenticated()) {
  //       // agar access token muddati tugagan bo'lsa refreshga harakat qilamiz
  //       try {
  //         if (accessToken && expiresAt && Date.now() >= expiresAt - 5_000) {
  //           await refresh();
  //         }
  //       } catch {
  //         // pass - redirect handled below
  //       }
  //     }
  //     setChecking(false);
  //   };
  //   run();
  // }, [hydrated, accessToken, expiresAt, refresh, isAuthenticated]);

  // if (!hydrated || checking) return <Loading />;

  // if (!isAuthenticated()) {
  //   return <Navigate to="/login" replace state={{ from: location }} />;
  // }
  return <>{children}</>;
}
