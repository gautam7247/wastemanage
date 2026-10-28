import React, { useState } from 'react';
import { getApiBaseUrl, setApiBaseUrl } from '../api/client';
import { materialsApi } from '../api/apiService';
import { X, Server, CheckCircle2, AlertCircle, RefreshCw, Sliders } from 'lucide-react';

export const ProxyConfigModal = ({ isOpen, onClose, onNotify }) => {
  const [url, setUrl] = useState(() => getApiBaseUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      setApiBaseUrl(url);
      const res = await materialsApi.getAll();
      setTestResult({
        success: true,
        message: `Successfully connected to backend! (${res.data?.length || 0} materials loaded)`,
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: `Connection failed: ${err.message}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    setApiBaseUrl(url);
    onNotify('Backend Proxy URL updated to: ' + (url || 'http://localhost:8080/api'), 'success');
    onClose();
  };

  const handleReset = () => {
    setUrl('http://localhost:8080/api');
    setApiBaseUrl('http://localhost:8080/api');
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-brand-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Backend & Proxy Config</h3>
              <p className="text-xs text-stone-400">Configure API server endpoint & port</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              API Base URL / Proxy Endpoint
            </label>
            <div className="relative">
              <Server className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://localhost:8080/api"
                className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Default: <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">http://localhost:8080/api</code> or relative <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">/api</code> via Vite proxy.
            </p>
          </div>

          {/* Test Status Feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2 text-xs ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              disabled={testing}
              onClick={handleTestConnection}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              Test Connection
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="py-2 px-3 text-xs font-semibold rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="py-2 px-4 text-xs font-bold rounded-xl bg-brand-700 hover:bg-brand-800 text-white transition-colors shadow-sm"
            >
              Save URL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProxyConfigModal;
