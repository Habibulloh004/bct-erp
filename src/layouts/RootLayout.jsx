import { Outlet } from 'react-router-dom';

export default function RootLayout() {
  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-900">
      <Outlet />
    </div>
  );
}
