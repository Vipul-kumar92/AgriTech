import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/StatCard';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  const fetchUsers = async (targetPage = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: '15'
      });
      if (search.trim()) params.append('search', search.trim());
      if (roleFilter) params.append('role', roleFilter);

      const res = await api.get(`/admin/users?${params.toString()}`);
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error('Failed to load registered users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page, roleFilter]);

  useEffect(() => {
    if (!toast.text) return;
    const timer = setTimeout(() => setToast({ type: '', text: '' }), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(1);
  };

  const handleToggleRole = async (targetUser) => {
    const nextRole = targetUser.role === 'ADMIN' ? 'FARMER' : 'ADMIN';
    setUpdatingId(targetUser.id);
    setToast({ type: '', text: '' });
    try {
      await api.put(`/admin/users/${targetUser.id}/role`, { role: nextRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: nextRole } : u))
      );
      setToast({
        type: 'success',
        text: `Updated ${targetUser.email} role to ${nextRole}.`
      });
    } catch (err) {
      setToast({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to update user role.'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Users className="w-3.5 h-3.5" />
          <span>User Directory Governance</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Registered Accounts
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Search registered users, filter by role, and manage FARMER / ADMIN privileges.
        </p>
      </div>

      {/* Non-blocking Toast Banner */}
      {toast.text && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between shadow-sm ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center space-x-2 font-semibold">
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast({ type: '', text: '' })}
            className="text-slate-500 hover:text-slate-800"
            aria-label="Dismiss toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Role Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user name or email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Search
          </button>
        </form>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Filter users by role"
        >
          <option value="">All Roles</option>
          <option value="FARMER">FARMER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Retrieving user directory..." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">User Identity</th>
                    <th className="px-6 py-3.5">Email Address</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Registration Date</th>
                    <th className="px-6 py-3.5 text-right">Role Governance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length > 0 ? (
                    users.map((u) => {
                      const isSelf = currentUser?.id === u.id;
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900 flex items-center">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs mr-3 flex-shrink-0">
                              {u.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span>
                              {u.name}
                              {isSelf && (
                                <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                  You
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-700 font-mono text-xs">{u.email}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                u.role === 'ADMIN'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-400">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleToggleRole(u)}
                              disabled={isSelf || updatingId === u.id}
                              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border disabled:opacity-45 disabled:cursor-not-allowed ${
                                u.role === 'ADMIN'
                                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                              }`}
                              title={isSelf ? 'Cannot change your own role' : 'Toggle role'}
                            >
                              {u.role === 'ADMIN' ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{updatingId === u.id ? 'Updating...' : 'Set Farmer'}</span>
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                                  <span>{updatingId === u.id ? 'Updating...' : 'Promote Admin'}</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                        No registered users match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Total matching accounts: {total}</span>
              <div className="flex items-center space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-slate-800">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
