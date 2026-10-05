import React, { useState } from 'react';
import { Clock, ShieldCheck, Search, Filter, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import type { AuditLogItem } from '../../types';

interface AuditLogViewProps {
  logs: AuditLogItem[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.performedBy.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.recordTitle.toLowerCase().includes(search.toLowerCase());
    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: AuditLogItem['action']) => {
    const map: Record<string, { label: string; className: string }> = {
      CREATE: { label: 'إنشاء', className: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
      UPDATE: { label: 'تعديل', className: 'bg-sky-950 text-sky-300 border-sky-800' },
      BRAND_UPDATE: { label: 'تعديل الهوية', className: 'bg-amber-950 text-amber-300 border-amber-800' },
      DELETE: { label: 'حذف', className: 'bg-red-950 text-red-300 border-red-800' },
      APPROVE: { label: 'اعتماد رسمي', className: 'bg-purple-950 text-purple-300 border-purple-800' },
      ARCHIVE: { label: 'أرشفة', className: 'bg-slate-800 text-slate-300 border-slate-700' },
      LOGIN: { label: 'تسجيل دخول', className: 'bg-blue-950 text-blue-300 border-blue-800' },
    };
    const s = map[action] || { label: action, className: 'bg-slate-800 text-slate-300 border-slate-700' };
    return (
      <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${s.className}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-400" />
            <span>سجل العمليات والتدقيق المؤسساتي (Audit Log)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            سجل غير قابل للتعديل أو المسح يوثق كافة الإجراءات الحساسة والتعديلات وهوية منفذيها وتوقيتها الدقيق
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>محمي بقواعد Firestore ABAC</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالمنفذ، التفاصيل، أو اسم السجل..."
            className="w-full pl-3 pr-9 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">جميع العمليات</option>
            <option value="CREATE">إنشاء (Create)</option>
            <option value="UPDATE">تعديل (Update)</option>
            <option value="BRAND_UPDATE">تعديل الهوية (Brand)</option>
            <option value="APPROVE">اعتماد رسمي (Approve)</option>
            <option value="DELETE">حذف (Delete)</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            لا توجد سجلات تدقيق مطابقة.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-medium">
                <tr>
                  <th className="py-3 px-4">نوع العملية</th>
                  <th className="py-3 px-4">السجل / الموضوع</th>
                  <th className="py-3 px-4">المنفذ</th>
                  <th className="py-3 px-4">التفاصيل</th>
                  <th className="py-3 px-4">التاريخ والوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">{getActionBadge(log.action)}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{log.recordTitle}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-300">{log.performedBy}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{log.performedByEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-md">{log.details}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString('ar-MA')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
