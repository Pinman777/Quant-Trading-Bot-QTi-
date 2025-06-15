import { Home, LineChart, Settings, Users, Wallet } from 'lucide-react';
import Link from 'next/link';

const menuItems = [
  { icon: Home, label: 'Дашборд', href: '/' },
  { icon: LineChart, label: 'Стратегии', href: '/strategies' },
  { icon: Wallet, label: 'Портфель', href: '/portfolio' },
  { icon: Users, label: 'Пользователи', href: '/users' },
  { icon: Settings, label: 'Настройки', href: '/settings' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-[#1a1a1a] border-r border-gray-800 h-screen fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white">QTi</h1>
        <p className="text-gray-400 text-sm mt-1">Quant Trading Bot</p>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
} 