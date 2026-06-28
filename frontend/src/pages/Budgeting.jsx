import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const Budgeting = ({ uploadTrigger }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [targetSavings, setTargetSavings] = useState(50000);
  const [isEditing, setIsEditing] = useState(false);
  const [inputVal, setInputVal] = useState("50000");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/analytics/summary');
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load budget metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [uploadTrigger]);

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
          {error || 'No budget data available. Please upload a bank statement!'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-lg flex-1 overflow-y-auto max-w-container-max mx-auto w-full">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Budget Analytics</h2>
          <p className="font-body-md text-on-surface-variant">Real-time overview of your financial performance.</p>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-lg">
        {/* Income vs Expenses Area Chart (8 cols) */}
        <div className="col-span-12 lg:col-span-8 glass-card rounded-xl p-lg flex flex-col gap-lg min-h-[400px]">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-headline-md text-on-surface mb-xs">Income vs Expenses</h3>
              <p className="font-label-sm text-on-surface-variant">Monthly cashflow trend</p>
            </div>
            <div className="flex gap-md text-xs">
              <div className="flex items-center gap-xs">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                <span className="font-label-sm">Income</span>
              </div>
              <div className="flex items-center gap-xs">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="font-label-sm">Expenses</span>
              </div>
            </div>
          </div>

          {/* Area Chart using Recharts */}
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthly_trends || []}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4edea3" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4edea3" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c0c1ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c0c1ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#4edea3"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#incomeGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#c0c1ff"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#expenseGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goal Tracker (4 cols) */}
        {(() => {
          const netSavings = data.net_savings || 0;
          const percent = targetSavings > 0 ? Math.min(Math.round((netSavings / targetSavings) * 100), 100) : 0;
          return (
            <div className="col-span-12 lg:col-span-4 glass-card rounded-xl p-lg flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-md">
                  <span className="font-label-md px-sm py-xs bg-primary-container/20 text-primary rounded-lg">Annual Goal</span>
                  <span className="material-symbols-outlined text-primary">swap_horiz</span>
                </div>
                <h3 className="font-headline-md text-on-surface">Savings Fund</h3>
                {isEditing ? (
                  <div className="flex items-center gap-xs mt-xs">
                    <span className="text-on-surface-variant text-sm">Target: ₹</span>
                    <input
                      type="number"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      onBlur={() => {
                        const val = parseFloat(inputVal);
                        if (!isNaN(val) && val > 0) {
                          setTargetSavings(val);
                        }
                        setIsEditing(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = parseFloat(inputVal);
                          if (!isNaN(val) && val > 0) {
                            setTargetSavings(val);
                          }
                          setIsEditing(false);
                        }
                      }}
                      autoFocus
                      className="bg-surface-container-high border border-primary/40 rounded px-2 py-0.5 text-xs text-on-surface w-24 outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                ) : (
                  <p
                    onClick={() => setIsEditing(true)}
                    className="font-body-md text-on-surface-variant mt-xs cursor-pointer hover:text-primary transition-colors flex items-center gap-xs"
                  >
                    Target: ₹{targetSavings.toLocaleString()}
                    <span className="material-symbols-outlined text-xs">edit</span>
                  </p>
                )}
              </div>
              <div className="relative z-10 py-xl flex flex-col items-center">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full rotate-[-90deg]">
                    <circle className="text-surface-container-highest" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" stroke-width="12"></circle>
                    <circle className="text-primary ring-progress" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeLinecap="round" strokeWidth="12" style={{ '--percent': percent }}></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-headline-lg text-primary">{percent}%</span>
                    <span className="font-label-sm text-on-surface-variant">of target</span>
                  </div>
                </div>
              </div>
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <p className="font-mono-data text-headline-md text-on-surface">₹{netSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="font-label-sm text-secondary">Active Savings</p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Category Progress Rings (12 cols) */}
        <div className="col-span-12 glass-card rounded-xl p-lg">
          <div className="flex justify-between items-center mb-lg">
            <h3 className="font-headline-md text-on-surface">Spending by Category</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-lg">
            {data.category_progress && data.category_progress.length > 0 ? (
              data.category_progress.map((item) => {
                const limit = {
                  'Shopping': 20000,
                  'Bill Payment': 15000,
                  'ATM': 10000,
                  'Railway': 8000,
                  'Cash Deposit': 50000,
                  'Others': 15000
                }[item.category] || 10000;
                
                const spent = item.amount || 0;
                const percentage = Math.min(Math.round((spent / limit) * 100), 100);
                
                return (
                  <div key={item.category} className="flex flex-col items-center gap-md p-md rounded-xl hover:bg-white/5 transition-colors cursor-default">
                    <div className="relative w-20 h-20">
                      <svg className="w-full h-full rotate-[-90deg]">
                        <circle className="text-surface-container-highest" cx="40" cy="40" fill="transparent" r="32" stroke="currentColor" strokeWidth="6"></circle>
                        <circle
                          className={`ring-progress-sm ${
                            percentage >= 90
                              ? 'text-tertiary'
                              : percentage >= 70
                              ? 'text-primary'
                              : 'text-secondary'
                          }`}
                          cx="40"
                          cy="40"
                          fill="transparent"
                          r="32"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="6"
                          style={{ '--percent': percentage }}
                        ></circle>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined">
                          {item.category === 'Shopping'
                            ? 'shopping_bag'
                            : item.category === 'Bill Payment'
                            ? 'receipt_long'
                            : item.category === 'ATM'
                            ? 'atm'
                            : 'payments'}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-label-md text-on-surface truncate max-w-[120px]">{item.category}</p>
                      <p className="font-mono-data text-label-sm text-on-surface-variant">
                        ₹{spent.toLocaleString(undefined, { maximumFractionDigits: 0 })} / ₹{limit >= 1000 ? `${(limit / 1000).toFixed(0)}k` : limit}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-on-surface-variant col-span-full text-center py-4">No budget tracking data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Budgeting;
