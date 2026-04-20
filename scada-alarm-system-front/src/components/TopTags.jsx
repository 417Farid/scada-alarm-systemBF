import { useEffect, useState } from "react";
import { api } from "../api/client";

function Spinner() {
    return (
        <span
            className="h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-cyan-200"
            aria-hidden="true"
        />
    );
}

export default function TopTags() {
    const [tags, setTags] = useState([]);
    const [range, setRange] = useState("7d");
    const [isLoading, setIsLoading] = useState(false);

    const getStartTime = () => {
        const now = new Date();

        switch (range) {
            case "24h":
                return new Date(now.setDate(now.getDate() - 1)).toISOString();
            case "7d":
                return new Date(now.setDate(now.getDate() - 7)).toISOString();
            case "30d":
                return new Date(now.setDate(now.getDate() - 30)).toISOString();
            default:
                return null;
        }
    };

    useEffect(() => {
        const fetchTags = async () => {
            setIsLoading(true);

            try {
                const start_time = getStartTime();

                const params = {
                    limit: 8
                };

                if (start_time) {
                    params.start_time = start_time;
                }

                const res = await api.get("/alarms/top-tags", { params });

                setTags(res.data);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTags();
    }, [range]);

    return (
        <article className="rounded-3xl border border-white/10 bg-gray-800/80 p-6 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)] backdrop-blur">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-400">Most frequent</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Top 8 Tags</h2>
                </div>
                <select
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                    disabled={isLoading}
                    className="rounded-full border border-white/10 bg-gray-900 px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                    <option value="24h">24h</option>
                    <option value="7d">7d</option>
                    <option value="30d">30d</option>
                </select>
            </div>

            <div className="mt-8 space-y-3">
                {isLoading ? (
                    <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-gray-950/20">
                        <Spinner />
                    </div>
                ) : tags.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-white/10 bg-gray-950/20 px-4 py-3 text-sm text-gray-400">
                        No data for selected range.
                    </p>
                ) : (
                    tags.map((tag) => (
                        <div key={tag.tag_name} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-gray-950/30 px-4 py-3">
                            <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-sm font-semibold text-cyan-200">
                                {tag.tag_name}
                            </span>
                            <span className="text-sm font-semibold text-violet-200">{tag.count}</span>
                        </div>
                    ))
                )}
            </div>
        </article>
    );
}
