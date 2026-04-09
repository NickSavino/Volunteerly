"use client";

import { Search } from "lucide-react";

type SelectOption = {
    value: string | number;
    label: string;
};

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
};

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
            <div
                className="
                    flex flex-col gap-4
                    lg:flex-row lg:items-end
                "
            >
                <div className="min-w-0 flex-1">
                    <label
                        className="
                            mb-1 block text-xs font-semibold tracking-wide text-muted-foreground
                            uppercase
                        "
                    >
                        {searchLabel}
                    </label>
                    <div className="relative">
                        <Search
                            className="
                                absolute top-1/2 left-3 h-4 w-max -translate-y-1/2
                                text-muted-foreground
                            "
                        />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && onSearchEnter?.()}
                            className="
                                w-full rounded-lg border py-2 pr-3 pl-9 text-sm text-foreground
                                focus:ring-2 focus:ring-ring focus:outline-none
                            "
                        />
                    </div>
                </div>

                <div
                    className="
                        w-full
                        lg:w-40
                    "
                >
                    <label
                        className="
                            mb-1 block text-xs font-semibold tracking-wide text-muted-foreground
                            uppercase
                        "
                    >
                        {sortLabel}
                    </label>
                    <select
                        value={sortValue}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="
                            w-full rounded-lg border px-3 py-2 text-sm text-gray-700
                            focus:ring-2 focus:ring-yellow-400 focus:outline-none
                        "
                    >
                        {sortOptions.map((option) => (
                            <option key={String(option.value)} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div
                    className="
                        w-full
                        lg:w-24
                    "
                >
                    <label
                        className="
                            mb-1 block text-xs font-semibold tracking-wide text-gray-400 uppercase
                        "
                    >
                        {pageSizeLabel}
                    </label>
                    <select
                        value={pageSizeValue}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="
                            w-full rounded-lg border px-3 py-2 text-sm text-gray-700
                            focus:ring-2 focus:ring-yellow-400 focus:outline-none
                        "
                    >
                        {pageSizeOptions.map((n) => (
                            <option key={n} value={n}>
                                {n}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={onApply}
                    className="
                        rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-black
                        hover:opacity-90
                    "
                >
                    {applyLabel}
                </button>
            </div>
        </div>
    );
}
