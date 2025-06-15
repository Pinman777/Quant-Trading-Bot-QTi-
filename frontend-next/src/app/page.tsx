'use client';

import { Layout } from '@/components/layout/Layout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { PriceChart } from '@/components/dashboard/PriceChart';
import { RecentTrades } from '@/components/dashboard/RecentTrades';
import { TrendingUp, DollarSign, Activity, Users } from 'lucide-react';

export default function Dashboard() {
  return (
    <Layout>
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Общий баланс"
            value="$45,231.89"
            iconName="DollarSign"
            trend={{ value: 20.1, isPositive: true }}
          />
          <MetricCard
            title="Активные стратегии"
            value="12"
            iconName="Activity"
            trend={{ value: 2, isPositive: true }}
          />
          <MetricCard
            title="Доходность"
            value="+15.3%"
            iconName="TrendingUp"
            trend={{ value: 5.2, isPositive: true }}
          />
          <MetricCard
            title="Активные пользователи"
            value="573"
            iconName="Users"
            trend={{ value: 3.1, isPositive: true }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PriceChart />
          <RecentTrades />
        </div>
      </div>
    </Layout>
  );
}
