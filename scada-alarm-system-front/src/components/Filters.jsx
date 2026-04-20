import { useEffect, useState } from "react";

function Spinner({ tone = "dark" }) {
    const colorClass = tone === "light" ? "border-gray-950/30 border-t-gray-950" : "border-white/20 border-t-cyan-200";

    return (
        <span
            className={`h-4 w-4 animate-spin rounded-full border-2 ${colorClass}`}
            aria-hidden="true"
        />
    );
}

function DateTimeField({ label, value, min, max, disabled, onChange }) {
    const inputClass = [
        "h-12 min-w-0 rounded-2xl border border-white/10 bg-gray-950/50 px-4 pr-11 text-sm font-medium outline-none transition [color-scheme:dark] focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-70",
        "[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:invert-[1] [&::-webkit-calendar-picker-indicator]:brightness-200",
        value ? "text-white" : "text-transparent",
    ].join(" ");

    return (
        <label className="flex flex-col gap-2 text-left">
            <span className="text-sm font-medium text-gray-300">{label}</span>
            <div className="relative">
                {!value && (
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                        Select a date
                    </span>
                )}
                <input
                    type="datetime-local"
                    className={`${inputClass} w-full`}
                    value={value}
                    min={min}
                    max={max}
                    onChange={onChange}
                    disabled={disabled}
                />
            </div>
        </label>
    );
}

export default function Filters({ tags, isLoading, onChange }) {
    const [tag, setTag] = useState("");
    const [criticality, setCriticality] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [pendingAction, setPendingAction] = useState(null);

    const apply = () => {
        setPendingAction("apply");
        onChange({
            tag,
            criticality,
            start_time: startTime ? new Date(startTime).toISOString() : "",
            end_time: endTime ? new Date(endTime).toISOString() : "",
        });
    };

    const clear = () => {
        setPendingAction("clear");
        setTag("");
        setCriticality("");
        setStartTime("");
        setEndTime("");
        onChange({});
    };

    useEffect(() => {
        if (!isLoading) {
            setPendingAction(null);
        }
    }, [isLoading]);

    const fieldClass = "h-12 min-w-0 rounded-2xl border border-white/10 bg-gray-950/50 px-4 text-sm font-medium text-white outline-none transition focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-300/10";
    const isApplying = isLoading && pendingAction === "apply";
    const isClearing = isLoading && pendingAction === "clear";

    return (
        <section className="rounded-3xl border border-white/10 bg-gray-800/80 px-5 py-4 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)] backdrop-blur">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                <div className="grid flex-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
                    <label className="flex flex-col gap-2 text-left">
                        <span className="text-sm font-medium text-gray-300">Filter by tag</span>
                        <select className={fieldClass} onChange={(e) => setTag(e.target.value)} value={tag} disabled={isLoading}>
                            <option value="">Select a tag</option>
                            {tags.map((tagOption) => (
                                <option key={tagOption} value={tagOption}>
                                    {tagOption}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="flex flex-col gap-2 text-left">
                        <span className="text-sm font-medium text-gray-300">Filter by criticality</span>
                        <select className={fieldClass} onChange={(e) => setCriticality(e.target.value)} value={criticality} disabled={isLoading}>
                            <option value="">Select a criticality</option>
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                            <option value="CRITICAL">CRITICAL</option>
                        </select>
                    </label>

                    <DateTimeField
                        label="From date"
                        value={startTime}
                        max={endTime || undefined}
                        onChange={(e) => setStartTime(e.target.value)}
                        disabled={isLoading}
                    />

                    <DateTimeField
                        label="To date"
                        value={endTime}
                        min={startTime || undefined}
                        onChange={(e) => setEndTime(e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                <div className="flex flex-col gap-3 xl:w-44">
                    <button
                        type="button"
                        onClick={apply}
                        disabled={isLoading}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 text-sm font-bold text-gray-950 shadow-[0_16px_36px_-18px_rgba(34,211,238,0.9)] transition hover:-translate-y-0.5 hover:bg-cyan-300 focus:outline-none focus:ring-4 focus:ring-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        {isApplying && <Spinner tone="light" />}
                        {isApplying ? "Applying..." : "Apply filters"}
                    </button>

                    <button
                        type="button"
                        onClick={clear}
                        disabled={isLoading}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-bold text-gray-200 transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-100 focus:outline-none focus:ring-4 focus:ring-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        {isClearing && <Spinner />}
                        {isClearing ? "Clearing..." : "Clear filters"}
                    </button>
                </div>
            </div>
        </section>
    );
}
