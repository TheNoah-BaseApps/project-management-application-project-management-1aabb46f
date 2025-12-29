'use client';

import BudgetSummaryWidget from '@/components/analytics/BudgetSummaryWidget';
import ProjectStatusWidget from '@/components/analytics/ProjectStatusWidget';
import VarianceChart from '@/components/analytics/VarianceChart';
import ForecastChart from '@/components/analytics/ForecastChart';

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BudgetSummaryWidget />
        <ProjectStatusWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VarianceChart />
        <ForecastChart />
      </div>
    </div>
  );
}