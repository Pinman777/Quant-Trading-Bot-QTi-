'use client';

import { LucideIcon, DollarSign, Activity, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: string;
  iconName: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const iconMap: { [key: string]: LucideIcon } = {
  DollarSign: DollarSign,
  Activity: Activity,
  TrendingUp: TrendingUp,
  Users: Users,
};

export function MetricCard({ title, value, iconName, trend }: MetricCardProps) {
  const IconComponent = iconMap[iconName];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-[#1a1a1a] p-6 rounded-lg shadow-md flex items-center justify-between"
    >
      <div>
        <h4 className="text-gray-400 text-sm font-medium">{title}</h4>
        <p className="text-white text-2xl font-bold mt-1">{value}</p>
        {trend && (
          <div
            className={`flex items-center text-sm mt-2 ${
              trend.isPositive ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {trend.isPositive ? '▲' : '▼'} {trend.value}%
          </div>
        )}
      </div>
      {IconComponent && <IconComponent className="w-8 h-8 text-blue-500" />}
    </motion.div>
  );
} 