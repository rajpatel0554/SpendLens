import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const Reports = ({ uploadTrigger }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/analytics/summary');
        setData(res.data);
        if (res.data.monthly_trends && res.data.monthly_trends.length > 0) {
          // Default to the most recent month
          setSelectedMonth(res.data.monthly_trends[res.data.monthly_trends.length - 1].month);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load reporting metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [uploadTrigger]);

  const handleDownloadReport = async () => {
    if (!selectedMonth) return;
    setDownloading(true);
    try {
      const response = await axios.get(`/api/report/monthly`, {
        params: { month: selectedMonth },
        responseType: 'blob' // Essential for receiving binary files
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SpendLens_Report_${selectedMonth}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert('Failed to download PDF report. Ensure transactions exist for the selected month.');
    } finally {
      setDownloading(false);
    }
  };

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
          {error || 'No reporting data available. Please upload a bank statement!'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-lg max-w-container-max mx-auto space-y-lg">
      {/* Page Actions Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div>
          <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface">Reporting Overview</h3>
          <p className="text-body-md font-body-md text-on-surface-variant">
            Insights and detailed analytics for your wealth management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-surface-container-high px-4 py-2.5 rounded-xl text-on-surface font-bold text-label-md border border-outline-variant/20 outline-none"
          >
            {data.monthly_trends && data.monthly_trends.length > 0 ? (
              data.monthly_trends.map((t) => (
                <option key={t.month} value={t.month}>
                  {t.month}
                </option>
              ))
            ) : (
              <option value="">No Months Available</option>
            )}
          </select>

          <button
            onClick={handleDownloadReport}
            disabled={!selectedMonth || downloading}
            className="bg-primary px-6 py-2.5 rounded-xl text-on-primary font-bold text-label-md flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:pointer-events-none"
          >
            {downloading ? (
              <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">download</span>
                <span>Download Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bento Grid - Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="glass-card p-lg rounded-3xl flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <div className="p-2 bg-secondary/20 text-secondary rounded-lg">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
          </div>
          <div>
            <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Net Profit/Loss</p>
            <h4 className="font-display-lg text-display-lg font-bold text-on-surface mt-1">
              ${(data.net_savings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
          </div>
        </div>

        <div className="glass-card p-lg rounded-3xl flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/10 rounded-full blur-3xl group-hover:bg-tertiary/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <div className="p-2 bg-tertiary/20 text-tertiary rounded-lg">
              <span className="material-symbols-outlined">shopping_bag</span>
            </div>
          </div>
          <div>
            <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Largest Spending Category</p>
            <h4 className="font-display-lg text-headline-lg font-bold text-on-surface mt-1 truncate">
              {data.largest_category || 'N/A'}
            </h4>
          </div>
        </div>

        <div className="glass-card p-lg rounded-3xl flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <div className="p-2 bg-primary/20 text-primary rounded-lg">
              <span className="material-symbols-outlined">savings</span>
            </div>
          </div>
          <div>
            <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Savings Rate</p>
            <h4 className="font-display-lg text-display-lg font-bold text-on-surface mt-1">
              {(data.savings_rate || 0).toFixed(1)}%
            </h4>
          </div>
        </div>
      </div>

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Monthly Cash Flow Bar Chart */}
        <div className="lg:col-span-8 glass-card p-lg rounded-3xl flex flex-col min-h-[380px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="font-headline-md text-headline-md font-bold text-on-surface">Monthly Cash Flow</h4>
              <p className="text-label-sm font-label-sm text-on-surface-variant">Comparing Income vs Expenses</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                <span className="text-label-sm font-label-sm text-on-surface-variant">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-label-sm font-label-sm text-on-surface-variant">Expenses</span>
              </div>
            </div>
          </div>

          <div className="flex-1 relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly_trends || []}>
                <XAxis dataKey="month" stroke="#908fa0" fontSize={12} />
                <YAxis stroke="#908fa0" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#102034',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#d3e4fe'
                  }}
                />
                <Bar dataKey="income" fill="#4edea3" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#c0c1ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tax Preparation Widget */}
        <div className="lg:col-span-4 glass-card p-lg rounded-3xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-on-surface-variant/10 text-primary rounded-xl">
                <span className="material-symbols-outlined">assignment_turned_in</span>
              </div>
              <h4 className="font-headline-md text-headline-md font-bold text-on-surface">Tax Readiness</h4>
            </div>
            <p className="text-body-md font-body-md text-on-surface-variant mb-6">
              Your financial records are organized and ready for the fiscal year export.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface-container rounded-xl border border-outline-variant/10">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">description</span>
                  <span className="text-label-md font-label-md text-on-surface">W-2/1099 Summary</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
                  download
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container rounded-xl border border-outline-variant/10">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">receipt</span>
                  <span className="text-label-md font-label-md text-on-surface">Deductible Expenses</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
                  download
                </span>
              </div>
            </div>
          </div>
          <button className="mt-8 w-full border border-primary text-primary py-3 px-4 rounded-xl font-bold text-label-md flex items-center justify-center gap-2 hover:bg-primary/10 transition-all active:scale-95">
            <span className="material-symbols-outlined text-[20px]">ios_share</span>
            Export Tax Documents
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
