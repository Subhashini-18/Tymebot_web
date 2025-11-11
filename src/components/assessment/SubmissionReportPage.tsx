import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '@/services/api/apiservice';
import { useToast } from '@/context/ToastContext';
import {
    Download,
    RefreshCw,
    FileText,
    Clock,
    CheckCircle,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    User,
    Shield,
    Star
} from 'lucide-react';

// ===== Helpers =====
const isIdKey = (key: string) => /(^id$|_id$|Id$|ID$)/.test(key);

const toLabel = (key: string) => key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());

// Deep flatten object for wide CSV coverage while skipping IDs
const flattenObject = (
    obj: any,
    prefix = '',
    rows: Record<string, any>[] = [],
    curr: Record<string, any> = {}
) => {
    if (obj == null) return rows;
    if (Array.isArray(obj)) {
        obj.forEach((item, i) => flattenObject(item, `${prefix}[${i}]`, rows));
        return rows;
    }
    if (typeof obj === 'object') {
        Object.entries(obj).forEach(([k, v]) => {
            if (isIdKey(k)) return;
            const newPrefix = prefix ? `${prefix}.${k}` : k;
            if (v && typeof v === 'object' && !Array.isArray(v)) {
                flattenObject(v, newPrefix, rows, curr);
            } else if (Array.isArray(v)) {
                v.forEach((item, i) => flattenObject(item, `${newPrefix}[${i}]`, rows));
            } else {
                curr[newPrefix] = v;
            }
        });
        if (Object.keys(curr).length) rows.push({ ...curr });
        return rows;
    }
    return rows;
};

// ===== Small UI Primitives =====
const Badge: React.FC<{ children: React.ReactNode; tone?: 'brand' | 'neutral' | 'success' | 'warning' | 'info' }>
    = ({ children, tone = 'neutral' }) => {
        const toneMap: Record<string, string> = {
            brand: 'bg-white/90 text-[#01443B] border-white/40',
            neutral: 'bg-gray-100 text-gray-800 border-gray-200',
            success: 'bg-green-100 text-green-800 border-green-200',
            warning: 'bg-amber-100 text-amber-800 border-amber-200',
            info: 'bg-blue-100 text-blue-800 border-blue-200',
        };
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${toneMap[tone]}`}>
                {children}
            </span>
        );
    };

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode; accent?: 'brand' | 'indigo' | 'green' | 'amber' }>
    = ({ icon, label, value, accent = 'brand' }) => {
        const ringMap: Record<string, string> = {
            brand: 'ring-[#09B591]/20',
            indigo: 'ring-indigo-200',
            green: 'ring-green-200',
            amber: 'ring-amber-200',
        };
        return (
            <div className={`rounded-xl bg-white border border-gray-200 shadow-sm ring-1 ${ringMap[accent]} p-4 flex items-start gap-3`}>
                <div className="shrink-0">{icon}</div>
                <div>
                    <div className="text-xs text-gray-500">{label}</div>
                    <div className="text-base font-semibold text-gray-900">{value}</div>
                </div>
            </div>
        );
    };

// Recursive value/object renderers that hide IDs
const isEmpty = (val: unknown): boolean =>
  val == null || (Array.isArray(val) && val.length === 0) || (typeof val === "object" && Object.keys(val || {}).length === 0);

const formatLabel = (key: string): string =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^\w/, (c) => c.toUpperCase());

const shouldHideKey = (key: string, value: unknown): boolean =>
  key.toLowerCase().endsWith("id") || (key === "status" && String(value).toLowerCase() === "success");

// --- Renderers ---
const EmptyValue: React.FC = () => (
  <span className="text-gray-400 italic">—</span>
);

const RenderValue: React.FC<{ value: unknown }> = ({ value }) => {
  if (isEmpty(value)) return <EmptyValue />;

  switch (typeof value) {
    case "boolean":
      return <span>{value ? "✅ Yes" : "❌ No"}</span>;

    case "number":
    case "string":
      return <span className="break-words">{String(value)}</span>;

    case "object":
      if (Array.isArray(value)) {
        return (
          <div className="flex flex-col gap-2">
            {value.length === 0 ? (
              <EmptyValue />
            ) : typeof value[0] === "object" ? (
              value.map((row, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-sm"
                >
                  <RenderObject obj={row as Record<string, unknown>} />
                </div>
              ))
            ) : (
              <ul className="list-disc pl-5">
                {value.map((v, i) => (
                  <li key={i}>
                    <RenderValue value={v} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      }
      return <RenderObject obj={value as Record<string, unknown>} />;

    default:
      return <span className="break-words">{String(value)}</span>;
  }
};

const RenderObject: React.FC<{ obj: Record<string, unknown> }> = ({ obj }) => {
  const entries = Object.entries(obj || {}).filter(
    ([k, v]) => !shouldHideKey(k, v)
  );

  if (entries.length === 0) return <EmptyValue />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {entries.map(([key, val]) => (
        <div key={key} className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-gray-500">
            {formatLabel(key)}
          </span>
          <div className="text-sm text-gray-800">
            <RenderValue value={val} />
          </div>
        </div>
      ))}
    </div>
  );
};


const SectionCard: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }>
    = ({ title, icon, children }) => (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50">
                {icon}
                <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
            </div>
            <div className="p-4">{children}</div>
        </div>
    );

// ===== Page =====
const SubmissionReportPage: React.FC = () => {
    const { submissionId } = useParams();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<Set<number>>(new Set());

    const BASE_API_PATH = import.meta.env.VITE_API_PATH || '/api/tyme/tracs/v1/';
    const BASE_PORT = import.meta.env.VITE_BASE_PORT || '8082';

    const containerRef = useRef<HTMLDivElement>(null);

    const fetchReport = useCallback(async () => {
        if (!submissionId) return;
        setLoading(true);
        setError(null);
        try {
            const res: any = await apiService.get(
                `${BASE_API_PATH}get_full_submission_report`,
                { id: Number(submissionId) },
                parseInt(BASE_PORT)
            );
            const payload = res?.data ?? res; // axios or raw fetch response
            setReport(payload?.data ?? payload);
        } catch (e: any) {
            console.error('Failed to load report', e);
            setError('Failed to load report');
            showToast({ message: 'Failed to load report', type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [submissionId, BASE_API_PATH, BASE_PORT, showToast]);

    useEffect(() => { fetchReport(); }, [fetchReport]);

    // Derived
    const title = useMemo(() => {
        const base = `Submission Report #${submissionId}`;
        const name = (report?.vendorName || report?.vendor?.name || report?.submission?.name);
        return name ? `${base} — ${name}` : base;
    }, [report, submissionId]);

    const timeline: any[] = useMemo(() => report?.timeline || [], [report]);
    const questions: any[] = useMemo(() => report?.questions || [], [report]);

    const vendorName = report?.vendorName || report?.vendor?.name;
    const riskLevelName = report?.riskLevelName || report?.riskLevel?.name;
    const submittedBy = report?.submittedBy;
    const statusText = report?.status;

    const aggregates = useMemo(() => {
        const totalQ = questions?.length || 0;
        let assessed = 0;
        let scores: number[] = [];
        (questions || []).forEach((q: any) => {
            const ass = q.assessments || [];
            if (ass.length) assessed++;
            ass.forEach((a: any) => typeof a.evaluationScore === 'number' && scores.push(a.evaluationScore));
        });
        const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : NaN;
        return { totalQ, assessed, avgScore: Number.isFinite(avg) ? Number(avg.toFixed(2)) : null };
    }, [questions]);

    // Exports
    const handleDownloadCSV = async () => {
        try {
            if (!report) return;
            const rows: any = flattenObject(report);
            if (!rows.length) {
                showToast({ message: 'Nothing to export', type: 'info' });
                return;
            }
            const headers = Array.from(
                rows.reduce((set, r) => {
                    Object.keys(r).forEach((k) => set.add(k));
                    return set;
                }, new Set<string>())
            );
            const escapeCell = (val: any) => {
                const s = String(val ?? '');
                const compact = s.replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
                return JSON.stringify(compact);
            };
            const csv = [
                headers.join(','),
                ...rows.map((r) => headers.map((h: any) => escapeCell(r[h])).join(',')),
            ].join('\n');

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `submission_${submissionId}_report.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            showToast({ message: 'CSV export failed', type: 'error' });
        }
    };

    const handleDownloadPDF = async () => {
        try {
            if (!containerRef.current) return;
            const [jspdfMod, html2canvas] = await Promise.all([
                import('jspdf'),
                import('html2canvas'),
            ]);
            const jsPDF = (jspdfMod as any).jsPDF;
            const canvas = await (html2canvas as any).default(containerRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                windowWidth: document.body.scrollWidth,
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            pdf.save(`submission_${submissionId}_report.pdf`);
        } catch (e) {
            console.error(e);
            showToast({ message: 'PDF export failed', type: 'error' });
        }
    };

    // UI helpers
    const eventDotClass = (t: any) => {
        const type = t?.eventType || t?.type;
        switch (type) {
            case 'SubmissionWorkflow': return 'bg-blue-500';
            case 'QuestionWorkflow': return 'bg-amber-500';
            case 'Assessment': return 'bg-purple-500';
            case 'QuestionAnswered': return 'bg-green-500';
            default: return 'bg-gray-400';
        }
    };

    const toggleQuestion = (qid: number) => {
        setExpanded(prev => {
            const next = new Set(prev);
            if (next.has(qid)) next.delete(qid); else next.add(qid);
            return next;
        });
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-6">
            {/* Branded header */}
            <div className="rounded-2xl border bg-gradient-to-r from-[#01443B] to-[#09B591] text-white p-5 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                    <div>
                        <h1 className="text-lg sm:text-xl font-semibold">{title}</h1>
                        <p className="text-xs sm:text-sm text-white/80">Comprehensive submission report</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {statusText && <Badge tone="brand">Status: {String(statusText)}</Badge>}
                        {vendorName && <Badge tone="brand"><User size={14} /> {vendorName}</Badge>}
                        {riskLevelName && <Badge tone="brand"><Shield size={14} /> {riskLevelName}</Badge>}
                        {submittedBy && <Badge tone="brand">Submitted By: {submittedBy}</Badge>}
                        {report?.lastUpdated && <Badge tone="brand"><Clock size={14} /> Updated: {report.lastUpdated}</Badge>}
                    </div>
                </div>
            </div>

            {/* Sticky actions */}
            <div className="sticky top-4 z-10 mt-4 ml-auto w-fit flex gap-2">
                <button
                    onClick={() => showToast({ message: 'Downloads coming soon', type: 'info' })}
                    className="inline-flex items-center gap-2 rounded-md bg-[#01443B] px-3 py-2 text-sm font-medium text-white hover:bg-[#013531] shadow"
                    title="Download PDF"
                >
                    <Download size={16} /> PDF
                </button>
                <button
                    onClick={() => showToast({ message: 'Downloads coming soon', type: 'info' })}
                    className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 border hover:bg-gray-50 shadow-sm"
                    title="Download CSV"
                >
                    <FileText size={16} /> CSV
                </button>
                <button
                    onClick={fetchReport}
                    className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 border hover:bg-gray-50 shadow-sm"
                    title="Refresh"
                >
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* States */}
            {loading && (
                <div className="mt-4 rounded-lg border p-6 text-sm text-gray-600 bg-white">Loading report…</div>
            )}
            {error && !loading && (
                <div className="mt-4 rounded-lg border p-6 text-sm text-red-700 bg-red-50">{error}</div>
            )}

            {!loading && !error && report && (
                <div ref={containerRef} className="mt-4 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <StatCard
                            icon={<div className="p-2 rounded-md bg-[#09B591]/10 text-[#01443B]"><CheckCircle size={18} /></div>}
                            label="Submission"
                            value={`#${submissionId}`}
                            accent="brand"
                        />
                        <StatCard
                            icon={<div className="p-2 rounded-md bg-indigo-100 text-indigo-700"><FileText size={18} /></div>}
                            label="Total Questions"
                            value={aggregates.totalQ ?? '—'}
                            accent="indigo"
                        />
                        <StatCard
                            icon={<div className="p-2 rounded-md bg-green-100 text-green-700"><Star size={18} /></div>}
                            label="Assessed"
                            value={aggregates.assessed ?? '—'}
                            accent="green"
                        />
                        <StatCard
                            icon={<div className="p-2 rounded-md bg-amber-100 text-amber-700"><Star size={18} /></div>}
                            label="Average Score"
                            value={aggregates.avgScore ?? '—'}
                            accent="amber"
                        />
                    </div>

                    {/* Overview */}
                    <SectionCard title="Submission Overview" icon={<FileText className="text-gray-700" size={18} />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs uppercase tracking-wide text-gray-500">Submission ID</div>
                                <div className="text-sm font-medium text-gray-900">#{submissionId}</div>
                            </div>
                            {vendorName && (
                                <div>
                                    <div className="text-xs uppercase tracking-wide text-gray-500">Vendor</div>
                                    <div className="text-sm font-medium text-gray-900">{vendorName}</div>
                                </div>
                            )}
                            {riskLevelName && (
                                <div>
                                    <div className="text-xs uppercase tracking-wide text-gray-500">Risk Level</div>
                                    <div className="text-sm font-medium text-gray-900">{riskLevelName}</div>
                                </div>
                            )}
                            {submittedBy && (
                                <div>
                                    <div className="text-xs uppercase tracking-wide text-gray-500">Submitted By</div>
                                    <div className="text-sm font-medium text-gray-900">{submittedBy}</div>
                                </div>
                            )}
                            {statusText && (
                                <div>
                                    <div className="text-xs uppercase tracking-wide text-gray-500">Status</div>
                                    <div className="text-sm font-medium text-gray-900">{String(statusText)}</div>
                                </div>
                            )}
                            <div>
                                <div className="text-xs uppercase tracking-wide text-gray-500">Timeline Events</div>
                                <div className="text-sm font-medium text-gray-900">{Array.isArray(timeline) ? timeline.length : 0}</div>
                            </div>
                            <div>
                                <div className="text-xs uppercase tracking-wide text-gray-500">Questions</div>
                                <div className="text-sm font-medium text-gray-900">{aggregates.totalQ ?? 0}</div>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Timeline */}
                    {Array.isArray(timeline) && timeline.length > 0 && (
                        <SectionCard title="Workflow Timeline" icon={<Clock className="text-blue-600" size={18} />}>
                            <div className="relative">
                                <div className="border-l-2 border-gray-200 ml-3">
                                    {timeline.map((t, idx) => (
                                        <div key={idx} className="ml-3 mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${eventDotClass(t)}`} />
                                                <div className="text-xs font-medium text-gray-800">{t.eventCode || t.eventType || 'Event'}</div>
                                                <div className="text-[10px] text-gray-500">{t.timestamp}</div>
                                            </div>
                                            <div className="text-[11px] text-gray-600 mt-1">
                                                <RenderObject obj={Object.fromEntries(Object.entries(t).filter(([k]) => !isIdKey(k) && !['eventCode', 'timestamp', 'eventType'].includes(k)))} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </SectionCard>
                    )}

                    {/* Questions */}
                    {Array.isArray(questions) && questions.length > 0 && (
                        <SectionCard title="Questions & Assessments" icon={<AlertTriangle className="text-orange-600" size={18} />}>
                            <div className="flex flex-col divide-y divide-gray-100">
                                {questions.map((q: any, i: number) => {
                                    const qid = q.vendorAssessmentQuestionId ?? q.questionId ?? i;
                                    const open = expanded.has(qid);
                                    return (
                                        <div key={qid} className="py-3">
                                            {/* Header */}
                                            <button
                                                onClick={() => toggleQuestion(qid)}
                                                className="w-full text-left flex items-start justify-between gap-3"
                                            >
                                                <div className="min-w-0">
                                                    <div className="text-xs uppercase text-gray-500">Question</div>
                                                    <div className="text-sm font-medium text-gray-900 break-words">
                                                        {q.questionText || q.text || `Question ${i + 1}`}
                                                    </div>
                                                    {/* Badges row */}
                                                    <div className="mt-1 flex flex-wrap gap-2">
                                                        {Array.isArray(q.assessments) && q.assessments.length > 0 && (
                                                            <Badge tone="info">Assessments: {q.assessments.length}</Badge>
                                                        )}
                                                        {typeof q.currentStatusCode === 'string' && (
                                                            <Badge tone="neutral">Status: {q.currentStatusCode}</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="shrink-0 text-gray-500">
                                                    {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </div>
                                            </button>

                                            {/* Body */}
                                            {open && (
                                                <div className="mt-3 space-y-4">
                                                    {/* Vendor Response */}
                                                    {q.response && (
                                                        <div>
                                                            <div className="text-xs uppercase text-gray-500 mb-1">Vendor Response</div>
                                                            {q.response.responseText && (
                                                                <div className="text-sm text-gray-800 whitespace-pre-wrap">{q.response.responseText}</div>
                                                            )}
                                                            {q.response.responseJson && (
                                                                <div className="mt-2 text-sm">
                                                                    <RenderObject obj={q.response.responseJson} />
                                                                </div>
                                                            )}
                                                            {Array.isArray(q.response.attachmentsJson) && q.response.attachmentsJson.length > 0 && (
                                                                <div className="mt-2">
                                                                    <div className="text-xs uppercase text-gray-500 mb-1">Attachments</div>
                                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                                        {q.response.attachmentsJson.map((a: any, ai: number) => {
                                                                            const isImage = typeof a.fileType === 'string' ? a.fileType.startsWith('image/') : /\.(png|jpe?g|gif|webp|svg)$/i.test(a.fileName || a.filePath || '');
                                                                            const isPdf = (typeof a.fileType === 'string' && a.fileType.includes('pdf')) || /\.pdf$/i.test(a.fileName || a.filePath || '');
                                                                            return (
                                                                                <div key={ai} className="rounded-md border bg-white p-2 shadow-sm">
                                                                                    {isImage && a.filePath ? (
                                                                                        <a href={a.filePath} target="_blank" rel="noreferrer" className="block">
                                                                                            <img src={a.filePath} alt={a.fileName || 'Attachment'} className="w-full h-28 object-cover rounded" />
                                                                                        </a>
                                                                                    ) : isPdf && a.filePath ? (
                                                                                        <a href={a.filePath} target="_blank" rel="noreferrer" className="block">
                                                                                            <object data={a.filePath} type="application/pdf" className="w-full h-28 rounded border">
                                                                                                <div className="w-full h-28 flex items-center justify-center text-xs text-gray-500">PDF Preview Unavailable</div>
                                                                                            </object>
                                                                                        </a>
                                                                                    ) : (
                                                                                        <a href={a.filePath} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline break-all text-sm">
                                                                                            {a.fileName || a.filePath}
                                                                                        </a>
                                                                                    )}
                                                                                    {a.fileType ? <div className="mt-1 text-[11px] text-gray-500">{a.fileType}</div> : null}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Assessments */}
                                                    {Array.isArray(q.assessments) && q.assessments.length > 0 && (
                                                        <div>
                                                            <div className="text-xs uppercase text-gray-500 mb-1">Assessments</div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {q.assessments.map((a: any, ai: number) => (
                                                                    <div key={ai} className="rounded-md border p-3 bg-gray-50">
                                                                        <div className="text-sm text-gray-800">Score: <span className="font-medium">{a.evaluationScore ?? '—'}</span></div>
                                                                        {a.compliantStatusId != null && (
                                                                            <div className="text-sm text-gray-800">Compliance: <span className="font-medium">{a.compliantStatusId === 1 ? 'Compliant' : a.compliantStatusId === 2 ? 'Partially Compliant' : a.compliantStatusId === 3 ? 'Non-Compliant' : 'Not Assessed'}</span></div>
                                                                        )}
                                                                        {a.evaluatedAt && <div className="text-xs text-gray-600">{a.evaluatedAt}</div>}
                                                                        {a.evaluationComment && (
                                                                            <div className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{a.evaluationComment}</div>
                                                                        )}
                                                                        {a.evidenceReviewSummary && (
                                                                            <div className="mt-1 text-xs text-gray-600 whitespace-pre-wrap">{a.evidenceReviewSummary}</div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </SectionCard>
                    )}

                    {/* Raw Data fallback */}
                    <SectionCard title="All Report Data" icon={<FileText className="text-gray-700" size={18} />}>
                        <RenderObject obj={report} />
                    </SectionCard>
                </div>
            )}
        </div>
    );
};

export default SubmissionReportPage;