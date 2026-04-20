import { useEffect, useState } from "react";
import { api } from "../api/client";
import AlarmTable from "../components/AlarmTable";
import Filters from "../components/Filters";
import Stats from "../components/Stats";
import TopTags from "../components/TopTags";

export default function Dashboard() {
    const [alarms, setAlarms] = useState([]);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState({});
    const [tagOptions, setTagOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 10;
    const skip = (page - 1) * limit;

    const updateFilters = (nextFilters) => {
        const cleanFilters = Object.fromEntries(
            Object.entries(nextFilters).filter(([, value]) => value)
        );

        setIsLoading(true);
        setPage(1);
        setFilters(cleanFilters);
        setRefreshKey((currentKey) => currentKey + 1);
    };

    const updatePage = (nextPage) => {
        setIsLoading(true);
        setPage(nextPage);
    };

    const fetchAlarms = async () => {
        setIsLoading(true);
        const startedAt = Date.now();

        try {
            const res = await api.get("/alarms", {
                params: {
                    ...filters,
                    skip,
                    limit,
                },
            });
            const alarmData = res.data.data;
            const elapsed = Date.now() - startedAt;
            const remainingDelay = Math.max(0, 450 - elapsed);

            if (remainingDelay > 0) {
                await new Promise((resolve) => setTimeout(resolve, remainingDelay));
            }

            setAlarms(alarmData);
            setTotal(res.data.total);
            setTagOptions((currentTags) => {
                const nextTags = alarmData.map((alarm) => alarm.tag_name).filter(Boolean);
                return [...new Set([...currentTags, ...nextTags])].sort();
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAlarms();
    }, [filters, refreshKey, page]);

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
            <header className="relative flex min-h-16 items-center justify-center">
                <div className="absolute left-0 flex h-[60px] w-[60px] items-center justify-center rounded-2xl border border-cyan-400/20 bg-gray-800/80 shadow-[0_10px_30px_-12px_rgba(34,211,238,0.65)]">
                    <img src="/soap-logo.svg" alt="SOAP Engineering" className="h-[52px] w-[52px] rounded-xl object-contain" />
                </div>

                <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Industrial monitoring</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                        SCADA Alarm Dashboard
                    </h1>
                </div>
            </header>

            <section className="grid gap-6 lg:grid-cols-2">
                <Stats />
                <TopTags />
            </section>

            <Filters tags={tagOptions} isLoading={isLoading} onChange={updateFilters} />

            <AlarmTable
                data={alarms}
                total={total}
                page={page}
                pageSize={limit}
                isLoading={isLoading}
                setPage={updatePage}
            />
        </main>
    );
}
