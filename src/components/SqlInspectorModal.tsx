import React, { useEffect, useState } from 'react';
import { SqlLog, SqlQueryResult } from '../types';
import { fetchSqlLogs, runSqlQuery } from '../services/taskApi';
import { X, Terminal, RefreshCw, Clock, Play, Code2, History, CheckCircle2, AlertCircle } from 'lucide-react';

interface SqlInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlInspectorModal: React.FC<SqlInspectorModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'playground' | 'logs'>('playground');
  const [logs, setLogs] = useState<SqlLog[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState<boolean>(false);

  // Playground state
  const [sqlQuery, setSqlQuery] = useState<string>(
    'SELECT c.name AS column_name, COUNT(t.id) AS task_count\nFROM columns c\nLEFT JOIN tasks t ON c.id = t.column_id\nGROUP BY c.id, c.name\nORDER BY c.position;'
  );
  const [queryResult, setQueryResult] = useState<SqlQueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const loadLogs = async () => {
    setIsLogsLoading(true);
    try {
      const data = await fetchSqlLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load SQL logs', err);
    } finally {
      setIsLogsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLogs();
      const interval = setInterval(loadLogs, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleRunQuery = async () => {
    if (!sqlQuery.trim()) return;
    setIsExecuting(true);
    setExecutionError(null);
    try {
      const res = await runSqlQuery(sqlQuery);
      setQueryResult(res);
      await loadLogs();
    } catch (err: any) {
      setExecutionError(err.message || 'Failed to execute query');
      setQueryResult(null);
    } finally {
      setIsExecuting(false);
    }
  };

  if (!isOpen) return null;

  const presetQueries = [
    {
      label: 'Tasks per Column (Query 1)',
      query: 'SELECT c.name AS column_name, COUNT(t.id) AS task_count\nFROM columns c\nLEFT JOIN tasks t ON c.id = t.column_id\nGROUP BY c.id, c.name\nORDER BY c.position;'
    },
    {
      label: 'High Priority Tasks (Query 2)',
      query: 'SELECT t.id, t.title, t.priority, t.progress_percent, c.name AS column_name\nFROM tasks t\nJOIN columns c ON t.column_id = c.id\nWHERE LOWER(t.priority) = "high"\nORDER BY t.created_at DESC;'
    },
    {
      label: 'All Tasks with Subtask Counts',
      query: 'SELECT t.id, t.title, t.priority, t.progress_percent, COUNT(s.id) AS total_subtasks\nFROM tasks t\nLEFT JOIN subtasks s ON t.id = s.task_id\nGROUP BY t.id\nORDER BY t.id ASC;'
    }
  ];

  const getTypeBadge = (type: SqlLog['type']) => {
    switch (type) {
      case 'SELECT':
        return 'bg-blue-900/60 text-blue-300 border-blue-700/50';
      case 'INSERT':
        return 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50';
      case 'UPDATE':
        return 'bg-amber-900/60 text-amber-300 border-amber-700/50';
      case 'DELETE':
        return 'bg-rose-900/60 text-rose-300 border-rose-700/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-slate-200 font-mono">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
                Live SQLite Query Inspector & Playground
                <span className="text-[10px] uppercase font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                  Interactive
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-sans">
                Inspect live queries or run custom raw SQL queries directly against SQLite DB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 font-sans text-xs">
              <button
                onClick={() => setActiveTab('playground')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'playground'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>SQL Playground</span>
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'logs'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Live Logs ({logs.length})</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: SQL Playground */}
        {activeTab === 'playground' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 font-sans">
            {/* Preset Query Buttons */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-2 font-sans">
                Quick Preset Queries:
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {presetQueries.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSqlQuery(item.query)}
                    className="text-[11px] font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-blue-400 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SQL Editor */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300 font-mono">SQL Editor</span>
                <span className="text-[11px] text-slate-500">Supports raw SELECT, INSERT, UPDATE, DELETE</span>
              </div>
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={4}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs font-mono text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 leading-relaxed shadow-inner"
                placeholder="Type raw SQL query here..."
              />
              <div className="flex justify-end">
                <button
                  onClick={handleRunQuery}
                  disabled={isExecuting || !sqlQuery.trim()}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
                  <span>Execute SQL Query</span>
                </button>
              </div>
            </div>

            {/* Execution Error Banner */}
            {executionError && (
              <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{executionError}</span>
              </div>
            )}

            {/* Query Results Table */}
            {queryResult && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-200 font-semibold">Query Output</span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded text-[11px] text-slate-400">
                      {queryResult.rowCount} {queryResult.rowCount === 1 ? 'row' : 'rows'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400 text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>{queryResult.executionMs} ms</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-x-auto">
                  {queryResult.rows.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs font-sans">
                      Query executed successfully. 0 rows returned.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-900 text-slate-300 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                        <tr>
                          {queryResult.columns.map((col, idx) => (
                            <th key={idx} className="px-4 py-2.5 font-semibold border-r border-slate-800/60 last:border-0">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {queryResult.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                            {queryResult.columns.map((col, cIdx) => (
                              <td key={cIdx} className="px-4 py-2 border-r border-slate-800/60 last:border-0 whitespace-nowrap">
                                {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-slate-600">NULL</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Live Execution Logs */}
        {activeTab === 'logs' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
            <div className="flex justify-between items-center text-xs px-1 text-slate-400 font-sans">
              <span>Recorded live queries against SQLite engine:</span>
              <button
                onClick={loadLogs}
                disabled={isLogsLoading}
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLogsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {logs.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs font-sans">
                No SQL queries recorded yet. Perform actions on the board to inspect live queries.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getTypeBadge(log.type)}`}>
                        {log.type}
                      </span>
                      <span className="text-slate-400 text-[11px]">{log.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>{log.execution_ms} ms</span>
                    </div>
                  </div>

                  <div className="text-xs text-blue-300 bg-slate-950/80 p-2.5 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-900">
                    <code>{log.query}</code>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center text-xs text-slate-400 font-sans">
          <span>Engine: SQLite (`node:sqlite`)</span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
