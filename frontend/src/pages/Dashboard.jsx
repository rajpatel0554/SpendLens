import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#c0c1ff', '#4edea3', '#ffb2b7', '#908fa0', '#ffb4ab', '#8083ff'];

const Dashboard = ({ uploadTrigger }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/analytics/summary', {
          params: { year: selectedYear || undefined }
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load financial summary.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [uploadTrigger, selectedYear]);

  if (loading) {
    return (
      <div className="p-lg flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-lg text-center">
        <div className="bg-error-container/20 border border-error/40 text-error rounded-xl p-md inline-block">
          {error || 'No data available. Please upload a bank statement to get started!'}
        </div>
      </div>
    );
  }

  // Prep Pie Chart Data
  const pieData = data.category_progress
    ? data.category_progress.map((item) => ({
        name: item.category,
        value: item.amount
      }))
    : [];

  const totalSpentPie = pieData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="p-lg max-w-container-max mx-auto">
      {/* Welcome Header */}
      <section className="mb-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary mb-1">Financial Overview</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Your savings rate is <span className="text-secondary font-bold">{(data.savings_rate || 0).toFixed(1)}%</span> this period. Great job!
          </p>
        </div>
        
        {/* Year Selector */}
        {data.available_years && data.available_years.length > 0 && (
          <div className="flex items-center gap-xs">
            <span className="font-label-md text-on-surface-variant text-sm mr-2">Select Year:</span>
            <select
              value={selectedYear || data.available_years[0]}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-surface-container-high px-4 py-2 rounded-xl text-on-surface font-bold text-label-md border border-outline-variant/20 outline-none cursor-pointer focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Time</option>
              {data.available_years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        )}
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
        {/* Total Balance Card (Large 8-col) */}
        <div className="md:col-span-8 glass-surface rounded-[2rem] p-lg flex flex-col overflow-hidden relative group min-h-[300px]">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              account_balance
            </span>
          </div>
          <div className="flex justify-between items-start mb-auto z-10">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant mb-2">Net Cashflow Savings</p>
              <h3 className="font-display-lg text-display-lg text-on-surface">
                ₹{(data.net_savings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <div className="flex items-center gap-2 mt-4 text-secondary">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span className="font-label-md">
                  +₹{(data.total_income || 0).toLocaleString()} Total Income
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-xs font-bold">
                Spent: ₹{(data.total_spent || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Sparkline using Recharts */}
          <div className="h-32 mt-8 w-full z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthly_trends || []}>
                <defs>
                  <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c0c1ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#c0c1ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#c0c1ff"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#sparklineGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Budget Progress (4-col) */}
        <div className="md:col-span-4 glass-surface rounded-[2rem] p-lg flex flex-col min-h-[300px]">
          <h4 className="font-headline-md text-headline-md text-on-surface mb-6">Budget Tracker</h4>
          <div className="space-y-6 flex-1 overflow-y-auto pr-1">
            {data.category_progress && data.category_progress.length > 0 ? (
              data.category_progress.slice(0, 3).map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between mb-2">
                    <span className="font-label-md text-on-surface">{item.category}</span>
                    <span className="font-mono-data text-on-surface-variant">
                      {item.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.percentage >= 90 ? 'bg-tertiary' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-on-surface-variant">No active budgets found.</p>
            )}
          </div>
        </div>

        {/* Spending by Category (Donut 5-col) */}
        <div className="md:col-span-5 glass-surface rounded-[2rem] p-lg">
          <h4 className="font-headline-md text-headline-md text-on-surface mb-6">Spending Analysis</h4>
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Total Spent</p>
                <p className="font-headline-md text-on-surface">₹{totalSpentPie.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full text-xs">
              {pieData.slice(0, 4).map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="font-label-sm text-on-surface-variant flex-1 truncate">{entry.name}</span>
                  <span className="font-mono-data text-on-surface font-semibold">
                    {totalSpentPie > 0 ? ((entry.value / totalSpentPie) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity List (7-col) */}
        <div className="md:col-span-7 glass-surface rounded-[2rem] p-lg overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-headline-md text-headline-md text-on-surface">Recent Activity</h4>
          </div>
          <div className="space-y-1 flex-1 overflow-y-auto pr-1">
            {data.recent_transactions && data.recent_transactions.length > 0 ? (
              data.recent_transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-surface-container-highest rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform text-primary">
                    <span className="material-symbols-outlined">
                      {tx.category === 'Shopping'
                        ? 'shopping_bag'
                        : tx.category === 'Bill Payment'
                        ? 'receipt_long'
                        : tx.category === 'ATM'
                        ? 'atm'
                        : 'payments'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-label-md text-on-surface truncate font-semibold">{tx.description}</p>
                    <p className="text-[12px] text-on-surface-variant">
                      {tx.category} • {new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-mono-data text-lg font-bold ${
                        tx.amount < 0 ? 'text-error' : 'text-secondary'
                      }`}
                    >
                      {tx.amount < 0 ? '-' : '+'}₹{Math.abs(tx.amount).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                      {tx.channel || 'Cleared'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-on-surface-variant p-4">No recent activity found. Upload a statement!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
