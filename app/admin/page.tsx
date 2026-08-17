"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { ShieldCheck, Lock, Trash2, CheckCircle, RefreshCw, RotateCw, AlertTriangle } from 'lucide-react';
import { Listing, ListingStatus } from '../../lib/types';
import { fetchAdminListings, setAdminListingStatus } from '../../lib/api';

type StatusFilter = 'todos' | ListingStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'reportado', label: 'Reportado' },
  { value: 'activo', label: 'Activo' },
  { value: 'resuelto', label: 'Resuelto' },
  { value: 'eliminado', label: 'Eliminado' },
];

// Triage priority: reported listings first, then by report count, then newest —
// so the riskiest items always surface at the top regardless of the active filter.
const sortForTriage = (items: Listing[]): Listing[] =>
  [...items].sort((a, b) => {
    const aReportado = a.estado === 'reportado' ? 0 : 1;
    const bReportado = b.estado === 'reportado' ? 0 : 1;
    if (aReportado !== bReportado) return aReportado - bReportado;

    const reportesDiff = (b.reportes || 0) - (a.reportes || 0);
    if (reportesDiff !== 0) return reportesDiff;

    return b.creadoEn - a.creadoEn;
  });

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [isOffline, setIsOffline] = useState(false);

  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [isListLoading, setIsListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Reusable loader: used right after login and by the manual "Actualizar" refresh
  // button, so both paths share one source of truth for fetch + offline fallback.
  const loadListings = useCallback(async () => {
    setIsListLoading(true);
    setListError(null);

    const result = await fetchAdminListings(adminKey);
    setIsListLoading(false);
    setIsOffline(result.offline);

    if (result.success) {
      setListings(result.items);
    } else {
      setListError(result.error || 'No se pudieron actualizar las publicaciones.');
    }
  }, [adminKey]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoginLoading(true);

    const result = await fetchAdminListings(adminKey);
    setIsLoginLoading(false);
    setIsOffline(result.offline);

    if (result.success) {
      setIsAuthenticated(true);
      setListings(result.items);
    } else {
      setLoginError(result.error || 'Clave de administrador incorrecta.');
    }
  };

  const handleAction = async (id: string, action: ListingStatus) => {
    const previousEstado = listings.find((i) => i.id === id)?.estado;
    setActionError(null);
    setPendingActionId(id);

    // Optimistic update — applied immediately for a responsive triage flow.
    setListings((prev) => prev.map((i) => (i.id === id ? { ...i, estado: action } : i)));

    const result = await setAdminListingStatus(id, action, adminKey);
    setPendingActionId(null);
    setIsOffline(result.offline);

    if (!result.success) {
      // Real (non-offline) rejection from the backend — roll back to stay coherent.
      setListings((prev) =>
        prev.map((i) => (i.id === id && previousEstado ? { ...i, estado: previousEstado } : i))
      );
      setActionError(result.error || 'No se pudo actualizar la publicación.');
    }
  };

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: listings.length };
    for (const item of listings) {
      counts[item.estado] = (counts[item.estado] || 0) + 1;
    }
    return counts;
  }, [listings]);

  const visibleListings = useMemo(() => {
    const filtered =
      statusFilter === 'todos' ? listings : listings.filter((i) => i.estado === statusFilter);
    return sortForTriage(filtered);
  }, [listings, statusFilter]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="glass-card max-w-sm w-full p-8 rounded-3xl shadow-lg text-center">
          <div className="w-14 h-14 rounded-2xl bg-solidarity-600/30 border border-solidarity-500/40 flex items-center justify-center text-emerald-700 mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold mb-2">Panel de Moderación (US-6.2)</h1>
          <p className="text-xs text-slate-400 mb-6">
            Ingrese la clave de administrador para revisar publicaciones reportadas o resueltas.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Clave de Administrador"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm text-center focus:border-emerald-500 focus:outline-none"
            />

            {loginError && (
              <p className="text-xs text-rose-400 font-semibold">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={isLoginLoading}
              className="touch-target w-full py-2.5 bg-solidarity-600 hover:bg-solidarity-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all disabled:opacity-60"
            >
              {isLoginLoading ? 'Verificando...' : 'Ingresar al Panel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-700" />
            Panel de Moderación de Publicaciones
          </h1>
          <p className="text-xs text-slate-400">
            Administración directa de estados: Activo, Reportado, Resuelto o Eliminado
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadListings}
            disabled={isListLoading}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded-lg flex items-center gap-1.5 disabled:opacity-60"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isListLoading ? 'animate-spin' : ''}`} />
            {isListLoading ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-xs text-rose-400 hover:underline"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {isOffline && (
        <div className="mb-4 p-3 rounded-xl bg-amber-950/60 border border-amber-700/60 text-amber-200 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
          <span>
            <strong>Modo offline/demo:</strong> el backend de moderación no respondió. Estás viendo y
            editando datos locales de prueba, no las publicaciones reales de producción.
          </span>
        </div>
      )}

      {listError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
          {listError}
        </div>
      )}

      {actionError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
          {actionError}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              statusFilter === f.value
                ? 'bg-solidarity-600 border-solidarity-500 text-white'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-slate-100'
            }`}
          >
            {f.label} ({statusCounts[f.value] || 0})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {visibleListings.length === 0 ? (
          <p className="text-center text-slate-500 text-sm py-12">
            No se encontraron publicaciones{statusFilter !== 'todos' ? ` con estado "${statusFilter}"` : ''}.
          </p>
        ) : (
          visibleListings.map((item) => (
            <div
              key={item.id}
              className="glass-card p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                    {item.tipo}
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    {item.ciudad} ({item.barrio})
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-mono ${
                      item.estado === 'activo'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : item.estado === 'reportado'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    Estado: {item.estado} ({item.reportes || 0} reportes)
                  </span>
                </div>
                <p className="text-xs text-slate-300 italic max-w-xl">
                  &ldquo;{item.descripcion}&rdquo;
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  WhatsApp: {item.whatsapp} | ID: {item.id}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleAction(item.id, 'activo')}
                  disabled={pendingActionId === item.id}
                  className="px-3 py-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 text-xs rounded-lg flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Restaurar Activo
                </button>

                <button
                  onClick={() => handleAction(item.id, 'reportado')}
                  disabled={pendingActionId === item.id}
                  className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700 text-xs rounded-lg flex items-center gap-1 disabled:opacity-50"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Reportado
                </button>

                <button
                  onClick={() => handleAction(item.id, 'resuelto')}
                  disabled={pendingActionId === item.id}
                  className="px-3 py-1.5 bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700 text-xs rounded-lg flex items-center gap-1 disabled:opacity-50"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Resuelto
                </button>

                <button
                  onClick={() => handleAction(item.id, 'eliminado')}
                  disabled={pendingActionId === item.id}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs rounded-lg flex items-center gap-1 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
