'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const trades = [
  {
    id: 1,
    pair: 'BTC/USDT',
    type: 'buy',
    price: 45000,
    amount: 0.1,
    time: '2024-03-20 14:30',
  },
  {
    id: 2,
    pair: 'ETH/USDT',
    type: 'sell',
    price: 2800,
    amount: 1.5,
    time: '2024-03-20 14:25',
  },
  {
    id: 3,
    pair: 'SOL/USDT',
    type: 'buy',
    price: 120,
    amount: 10,
    time: '2024-03-20 14:20',
  },
];

export function RecentTrades() {
  return (
    <div className="bg-[#1a1a1a] p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Последние сделки</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-400">
              <th className="pb-4">Пара</th>
              <th className="pb-4">Тип</th>
              <th className="pb-4">Цена</th>
              <th className="pb-4">Объем</th>
              <th className="pb-4">Время</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className="border-t border-gray-800">
                <td className="py-4">{trade.pair}</td>
                <td className="py-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${
                      trade.type === 'buy'
                        ? 'bg-green-900/20 text-green-400'
                        : 'bg-red-900/20 text-red-400'
                    }`}
                  >
                    {trade.type === 'buy' ? (
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                    )}
                    {trade.type === 'buy' ? 'Покупка' : 'Продажа'}
                  </span>
                </td>
                <td className="py-4">${trade.price.toLocaleString()}</td>
                <td className="py-4">{trade.amount}</td>
                <td className="py-4 text-gray-400">{trade.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 