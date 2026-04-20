const criticalityStyles = {
    CRITICAL: "border-rose-300/30 bg-rose-400/15 text-rose-200",
    HIGH: "border-red-300/30 bg-red-400/15 text-red-200",
    MEDIUM: "border-amber-300/30 bg-amber-400/15 text-amber-200",
    LOW: "border-sky-300/30 bg-sky-400/15 text-sky-200",
};

function getCriticalityClass(criticality) {
    return criticalityStyles[criticality] || "border-gray-300/20 bg-gray-400/10 text-gray-200";
}

function getStateClass(state) {
    return state === "ACTIVE"
        ? "border-l-cyan-300 bg-cyan-300/[0.03]"
        : "border-l-transparent";
}

function formatDateTime(value) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).format(date);
}

function TableLoading() {
    return (
        <tr>
            <td colSpan="5" className="px-6 py-12">
                <div className="flex flex-col items-center justify-center gap-4 text-center text-gray-300">
                    <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-300" aria-hidden="true" />
                    <div>
                        <p className="font-semibold text-white">Loading alarms</p>
                        <p className="mt-1 text-sm text-gray-400">Refreshing the table with your filters.</p>
                    </div>
                </div>
            </td>
        </tr>
    );
}

export default function AlarmTable({ data, total, page, pageSize, isLoading, setPage }) {
    const currentPage = Number.isFinite(page) ? page : 1;
    const rowsPerPage = Number.isFinite(pageSize) ? pageSize : 10;
    const totalRows = Number.isFinite(total) ? total : 0;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
    const firstItem = totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const lastItem = Math.min(currentPage * rowsPerPage, totalRows);
    const canGoPrev = currentPage > 1 && !isLoading;
    const canGoNext = currentPage < totalPages && !isLoading;
    const paginationButtonClass = "inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-bold text-gray-200 transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:border-white/10 disabled:hover:bg-white/5 disabled:hover:text-gray-200";

    return (
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-gray-800/80 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)] backdrop-blur">
            <div className="flex flex-col gap-3 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-400">Alarm events</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Alarm History</h2>
                </div>
                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-200">
                    Total: {total}
                </div>
            </div>

            <div className="relative min-h-[420px] overflow-x-auto">
                {isLoading && data.length > 0 && (
                    <div className="absolute inset-0 z-10 flex items-start justify-center bg-gray-950/45 px-6 pt-16 backdrop-blur-[2px]">
                        <div className="flex items-center gap-3 rounded-2xl border border-cyan-300/20 bg-gray-950/85 px-5 py-4 shadow-[0_20px_50px_-24px_rgba(34,211,238,0.8)]">
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-cyan-300" aria-hidden="true" />
                            <span className="text-sm font-semibold text-cyan-100">Refreshing alarms...</span>
                        </div>
                    </div>
                )}

                <table className={`w-full min-w-[860px] border-collapse text-left text-sm transition-opacity duration-200 ${isLoading && data.length > 0 ? "opacity-45" : "opacity-100"}`}>
                    <thead className="bg-gray-950/40">
                        <tr className="text-xs uppercase tracking-[0.18em] text-gray-400">
                            <th className="px-6 py-4 font-semibold">Tag</th>
                            <th className="px-6 py-4 font-semibold">Criticality</th>
                            <th className="px-6 py-4 font-semibold">State</th>
                            <th className="px-6 py-4 font-semibold">Time</th>
                            <th className="px-6 py-4 text-center font-semibold">Anomaly</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {isLoading && data.length === 0 ? (
                            <TableLoading />
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-400">
                                    No alarms found with the current filters.
                                </td>
                            </tr>
                        ) : (
                            data.map((alarm) => (
                                <tr
                                    key={alarm.alarm_id}
                                    className={`border-l-4 transition hover:bg-white/[0.04] ${getStateClass(alarm.event_state)}`}
                                >
                                    <td className="px-6 py-4 font-semibold text-white">{alarm.tag_name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getCriticalityClass(alarm.criticality)}`}>
                                            {alarm.criticality}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-gray-300">{alarm.event_state}</span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-300">{formatDateTime(alarm.event_time)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold ${alarm.is_anomaly ? "border-emerald-300/30 bg-emerald-400/15 text-emerald-300" : "border-gray-300/10 bg-gray-400/10 text-gray-500"}`}>
                                            {alarm.is_anomaly ? "\u2713" : "-"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col gap-4 border-t border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-400">
                    Showing <span className="font-semibold text-gray-200">{firstItem}</span> to{" "}
                    <span className="font-semibold text-gray-200">{lastItem}</span> of{" "}
                    <span className="font-semibold text-gray-200">{totalRows}</span> alarms
                </p>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        disabled={!canGoPrev}
                        onClick={() => setPage(currentPage - 1)}
                        className={paginationButtonClass}
                    >
                        Prev
                    </button>

                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-200">
                        Page {currentPage} / {totalPages}
                    </span>

                    <button
                        type="button"
                        disabled={!canGoNext}
                        onClick={() => setPage(currentPage + 1)}
                        className={paginationButtonClass}
                    >
                        Next
                    </button>
                </div>
            </div>
        </section>
    );
}
