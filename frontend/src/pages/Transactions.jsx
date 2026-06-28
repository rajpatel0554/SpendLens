import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CATEGORIES = [
  'All',
  'Shopping',
  'Bill Payment',
  'ATM',
  'Railway',
  'Cash Deposit',
  'IMPS Transfer',
  'NEFT Transfer',
  'RTGS Transfer',
  'Fund Transfer',
  'AEPS Transaction',
  'Cheque',
  'RuPay',
  'Bank Transfer',
  'Others'
];

const Transactions = ({ uploadTrigger }) => {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const params = {
          skip: (page - 1) * limit,
          limit: limit
        };
        if (category !== 'All') {
          params.category = category;
        }
        const res = await axios.get('/api/transactions', { params });
        setTxs(res.data);
        
        // Fetch total count for pagination (for demo, we can approximate or use headers if available)
        // Since sqlite doesn't return count directly in this endpoint, we'll set it dynamically based on page length
        setTotalCount(res.data.length < limit ? (page - 1) * limit + res.data.length : 1248);
      } catch (err) {
        console.error(err);
        setError('Failed to load transactions.');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [page, category, limit, uploadTrigger]);

  const filteredTxs = txs.filter((tx) =>
    tx.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-lg max-w-container-max mx-auto w-full flex flex-col gap-lg">
      {/* Header & Filter Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Financial History</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Review and manage your global spending and income.
          </p>
        </div>

        <div className="flex flex-wrap gap-sm items-center">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-variant pointer-events-none">
              <span className="material-symbols-outlined text-body-md">search</span>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-surface-container border border-outline-variant/20 rounded-full pl-10 pr-4 py-2 font-body-md text-body-md focus:ring-2 focus:ring-primary w-64 outline-none text-on-surface transition-all"
              placeholder="Search transactions..."
            />
          </div>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-error-container/20 border border-error/40 text-error rounded-xl p-md text-label-md">
          {error}
        </div>
      )}

      {/* Main Data Table Card */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-xl flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredTxs.length === 0 ? (
            <div className="p-xl text-center text-on-surface-variant">
              No transactions found. Try uploading a statement file or changing filters.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high/40 text-on-surface-variant border-b border-outline-variant/30">
                  <th className="p-lg font-label-md text-label-md uppercase tracking-wider">Date</th>
                  <th className="p-lg font-label-md text-label-md uppercase tracking-wider">Description</th>
                  <th className="p-lg font-label-md text-label-md uppercase tracking-wider">Category</th>
                  <th className="p-lg font-label-md text-label-md uppercase tracking-wider">Status</th>
                  <th className="p-lg font-label-md text-label-md uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredTxs.map((tx) => {
                  const isAnomaly = tx.anomalies && tx.anomalies.length > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                      <td className="p-lg font-mono-data text-mono-data text-on-surface-variant">
                        {new Date(tx.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="p-lg">
                        <div className="flex items-center gap-md">
                          <div className="w-8 h-8 rounded-lg bg-surface-bright flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-body-md">
                              {tx.category === 'Shopping'
                                ? 'shopping_bag'
                                : tx.category === 'Bill Payment'
                                ? 'receipt_long'
                                : tx.category === 'ATM'
                                ? 'atm'
                                : 'payments'}
                            </span>
                          </div>
                          <div>
                            <p className="font-body-md text-body-md font-semibold text-on-surface">
                              {tx.description}
                            </p>
                            <p className="text-xs text-on-surface-variant">{tx.channel || 'Direct'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-lg">
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm border border-primary/20">
                          {tx.category}
                        </span>
                      </td>
                      <td className="p-lg">
                        {isAnomaly ? (
                          <div
                            className="flex items-center gap-xs text-tertiary font-label-sm text-label-sm group/tooltip relative"
                            title={tx.anomalies[0].reason}
                          >
                            <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(255,81,106,0.5)]"></span>
                            <span className="font-bold underline decoration-dotted decoration-tertiary">
                              Anomaly Flagged
                            </span>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:block bg-surface-container-highest border border-outline-variant/30 text-on-surface text-xs rounded-xl p-3 w-64 z-50 shadow-xl">
                              {tx.anomalies[0].reason}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-xs text-secondary font-label-sm text-label-sm">
                            <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(78,222,163,0.5)]"></span>
                            Cleared
                          </div>
                        )}
                      </td>
                      <td
                        className={`p-lg text-right font-mono-data text-body-md font-bold ${
                          tx.amount < 0 ? 'text-error' : 'text-secondary'
                        }`}
                      >
                        {tx.amount < 0 ? '-' : '+'}₹{Math.abs(tx.amount).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-lg flex items-center justify-between border-t border-outline-variant/30 bg-surface-container-low/30">
          <p className="font-label-md text-label-md text-on-surface-variant">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} transactions
          </p>
          <div className="flex items-center gap-sm">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-2 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md font-bold">
              {page}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={filteredTxs.length < limit}
              className="p-2 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
