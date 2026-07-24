const STYLES: Record<string, string> = {
  OPEN: "bg-blue-50 text-blue-700 border-blue-200",
  MATCHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED: "bg-slate-100 text-slate-500 border-slate-200",
  PENDING_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-blue-50 text-blue-700 border-blue-200",
  REJECTED: "bg-red-50 text-red-600 border-red-200",
  ACCEPTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-cyan-50 text-cyan-700 border-cyan-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
  PRODUCT: "bg-violet-50 text-violet-700 border-violet-200",
  SERVICE: "bg-teal-50 text-teal-700 border-teal-200",
};

export default function StatusBadge({ value }: { value: string }) {
  const style = STYLES[value] ?? "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span
      className={`inline-block text-xs font-semibold rounded-full border px-2.5 py-0.5 ${style}`}
    >
      {value.replace("_", " ")}
    </span>
  );
}
