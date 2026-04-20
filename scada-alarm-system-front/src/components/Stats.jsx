import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const CRITICALITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

function MetricIcon({ type }) {
    const iconClass = type === "alarm" ? "text-cyan-300" : "text-rose-300";

    return (
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 ${iconClass}`}>
            {type === "alarm" ? (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M5.5 7.5 8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M18.5 7.5 16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M7 21h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M8 18v-5a4 4 0 0 1 8 0v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ) : (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 4 3 20h18L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M12 9v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
            )}
        </span>
    );
}

function formatNumber(value) {
    return new Intl.NumberFormat("en-US").format(value ?? 0);
}

function formatPercent(value) {
    return `${value.toFixed(1)}%`;
}

export default function Stats() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get("/alarms/stats").then((res) => setStats(res.data));
    }, []);

    const total = stats?.total ?? 0;
    const anomalies = stats?.anomalies ?? 0;
    const anomalyRate = total > 0 ? (anomalies / total) * 100 : 0;

    const criticalityStats = useMemo(() => {
        const byCriticality = stats?.by_criticality ?? {};

        return CRITICALITY_ORDER.map((level) => {
            const value = byCriticality[level] ?? 0;
            const share = total > 0 ? (value / total) * 100 : 0;

            return {
                level,
                value,
                share,
            };
        });
    }, [stats, total]);

    const topCriticality = criticalityStats.reduce(
        (highest, current) => (current.value > highest.value ? current : highest),
        { level: "--", value: 0, share: 0 }
    );

    return (
        <article className="rounded-3xl border border-white/10 bg-gray-800/80 p-6 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)] backdrop-blur">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-400">Alarm summary</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Total & Anomalies</h2>
                </div>
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                    Live
                </span>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-gray-950/30 p-5">
                    <MetricIcon type="alarm" />
                    <p className="mt-5 text-sm text-gray-400">Total alarms</p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-white">{stats ? formatNumber(total) : "--"}</p>
                    <p className="mt-3 text-sm text-gray-400">
                        Highest volume: <span className="font-semibold text-gray-200">{topCriticality.level}</span>
                    </p>
                </div>

                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-5">
                    <MetricIcon type="anomaly" />
                    <p className="mt-5 text-sm text-rose-100/75">Detected anomalies</p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-rose-300">{stats ? formatNumber(anomalies) : "--"}</p>
                    <p className="mt-3 text-sm text-rose-100/80">
                        Anomaly rate: <span className="font-semibold text-rose-200">{stats ? formatPercent(anomalyRate) : "--"}</span>
                    </p>
                </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-gray-950/20 p-5">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-medium text-gray-300">Criticality distribution</p>
                        <p className="mt-1 text-sm text-gray-500">Share of total alarms by severity level</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-gray-300">
                        {stats ? formatNumber(total) : "--"} total
                    </span>
                </div>

                <div className="mt-5 space-y-4">
                    {criticalityStats.map(({ level, value, share }) => (
                        <div key={level} className="space-y-2">
                            <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="font-medium text-gray-200">{level}</span>
                                <div className="flex items-center gap-3 text-gray-300">
                                    <span>{stats ? formatPercent(share) : "--"}</span>
                                    <span className="w-14 text-right font-semibold text-white">
                                        {stats ? formatNumber(value) : "--"}
                                    </span>
                                </div>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/5">
                                <div
                                    className="h-full rounded-full bg-cyan-300 transition-[width] duration-500"
                                    style={{ width: `${share}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </article>
    );
}
