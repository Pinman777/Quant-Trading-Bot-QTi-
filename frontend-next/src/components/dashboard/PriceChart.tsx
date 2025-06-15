'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '00:00', price: 4000 },
  { time: '04:00', price: 4200 },
  { time: '08:00', price: 4100 },
  { time: '12:00', price: 4300 },
  { time: '16:00', price: 4400 },
  { time: '20:00', price: 4500 },
  { time: '24:00', price: 4600 },
];

export function PriceChart() {
  return (
    <div className="bg-[#1a1a1a] p-6 rounded-lg h-[400px]">
      <h3 className="text-lg font-semibold mb-4">График цен</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="time" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 