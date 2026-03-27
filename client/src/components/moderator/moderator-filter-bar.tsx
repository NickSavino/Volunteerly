"use client";

import { Search } from "lucide-react";

type SelectOption = {
    value: string | number;
    label: string;
}

type ModeratorFilterBarProps = {
    // Search Options
    searchLabel: string;
    searchPlaceholder: string;
    searchValue: string;
    onSearchChange: (value: string) => void;
    onSearchEnter?: () => void;

    // Sorting Options
    sortLabel: string;
    sortValue: string;
    onSortChange: (value: string) => void;
    sortOptions: SelectOption[];

    //Page Size Option
    pageSizeLabel?: string;
    pageSizeValue: number;
    onPageSizeChange: (value: number) => void;
    pageSizeOptions: readonly number[];

    onApply: () => void;
    applyLabel?: string;
}

export function ModeratorFilterBar({
    searchLabel,
    searchPlaceholder,
    searchValue,
    onSearchChange,
    onSearchEnter,
    sortLabel,
    sortValue,
    onSortChange,
    sortOptions,
    pageSizeLabel = "Show Per Page",
    pageSizeValue,
    onPageSizeChange,
    pageSizeOptions,
    onApply,
    applyLabel = "Apply Filters",
}: ModeratorFilterBarProps) {
    return (
        <div className="mb-4 rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <div className="min-w-0 flex-1">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {searchLabel}
                    </label>
                <div className="relative">
                    <Search className="absolute w-max left-3 top-1/2 h-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onSearchEnter?.()}
                        className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                </div>
            </div>

            <div className="w-full lg:w-40">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {sortLabel}
                </label>
                <select
                    value={sortValue}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400">
                        {sortOptions.map((option) => (
                            <option key={String(option.value)} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                </select>
            </div>

            <div className="w-full lg:w-24">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {pageSizeLabel}
                </label>
                <select
                    value={pageSizeValue}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400">
                        {pageSizeOptions.map((n) => (
                            <option key={n} value={n}>
                                {n}
                            </option>
                        ))}
                </select>
            </div>

            <button
                onClick={onApply}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-black hover:opacity-90">
                {applyLabel}
            </button>
        </div>
    </div>
    )
}