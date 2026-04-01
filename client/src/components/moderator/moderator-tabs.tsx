"use client";

import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

type ModeratorTabItem<T extends string> = {
    key: T;
    label: string;
};

type ModeratorTabProps<T extends string> = {
    tabs: ModeratorTabItem<T>[];
    activeTab: T;
    counts: Record<T, number>;
    onChange: (tab: T) => void;
    className?: string;
};

export function ModeratorTabs<T extends string>({
    tabs,
    activeTab,
    counts,
    onChange,
    className,
}: ModeratorTabProps<T>) {
    return (
        <Tabs
            value={activeTab}
            onValueChange={(value) => onChange(value as T)}
            className={className}
        >
            <TabsList
                variant="line"
                className="mb-0 w-full justify-start rounded-none border-b bg-card p-0"
            >
                {tabs.map(({ key, label }) => (
                    <TabsTrigger
                        key={key}
                        value={key}
                        className="
                        rounded-none 
                        border-b-2 
                        border-transparent 
                        px-5 
                        py-3 
                        text-sm 
                        font-medium
                        text-muted-foreground
                        shadow-none
                        data-[state=active]:border-primary
                        data-[state=active]:text-foreground">
                            {label} ({counts[key]})
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}