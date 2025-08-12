import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import Logo from '@/components/shared/Logo';
import {
  Home, Users, Package, Boxes, HandCoins, Wallet,
  Plus, Bell, MessageSquare, Menu
} from 'lucide-react';

export default function DashboardLayout() {
  const logout = useAuthStore(s => s.logout);
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();

  const nav = [
    { to: '/app', label: 'Главная', Icon: Home },
    { to: '/app/clients', label: 'Клиенты', Icon: Users },
    { to: '/app/products', label: 'Товары', Icon: Package },
    { to: '/app/warehouse', label: 'Склад', Icon: Boxes },
    { to: '/app/deals', label: 'Сделки', Icon: HandCoins },
    { to: '/app/finance', label: 'Финансы', Icon: Wallet },
  ];

  const linkClass = (active) =>
    `inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors
     ${active
       ? 'bg-white/15 border-white/20 text-white'
       : 'bg-transparent border-white/10 text-white/80 hover:bg-white/10'
     }`;

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1">
        <header className="h-20 border-b border-white/10 bg-[#2A2C38] flex items-center justify-between px-3 sm:px-4">
          <div className="flex items-center gap-5">
            <Logo />
            <nav className="hidden md:flex items-center gap-2">
              {nav.map(({ to, label }) => (
                <NavLink key={to} to={to} className={({ isActive }) => linkClass(isActive)}>
                  {/* <Icon className="h-4 w-4" /> */}
                  <span className="hidden sm:inline">{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/app/deals/new')}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/10 hover:bg-white/20 text-white"
              title="Создать сделку"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm">Создать сделку</span>
            </button>

            <button
              className="relative p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white"
              title="Уведомления"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 rounded-full bg-red-500 text-[10px] leading-none text-white px-1.5 py-0.5">
                9
              </span>
            </button>

            <button
              className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white"
              title="Сообщения"
            >
              <MessageSquare className="h-5 w-5" />
            </button>

            <button
              className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white md:hidden"
              title="Меню"
              onClick={() => {/* TODO: open mobile menu / sidebar */}}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden sm:flex items-center gap-3 pl-2 ml-1 border-l border-white/10">
              <span className="text-sm text-white/80">{user?.name}</span>
              <button onClick={logout} className="px-3 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white">
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}