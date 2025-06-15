import { Bell, Search, User } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 bg-[#1a1a1a] border-b border-gray-800 fixed top-0 right-0 left-64 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center flex-1">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Поиск..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="flex items-center space-x-2 p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">
            <User className="w-5 h-5" />
            <span className="text-sm">Админ</span>
          </button>
        </div>
      </div>
    </header>
  );
} 