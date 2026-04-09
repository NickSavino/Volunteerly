import { LucideIcon } from "lucide-react";

type ModStatCardProps = {
    icon: LucideIcon;
    label: string;
    count: number;
};

export function ModStatCard({ icon: Icon, label, count }: ModStatCardProps) {
    return (
        <div className="flex items-center gap-4 rounded-xl border bg-white p-5 shadow-sm">
            <div className="rounded-md bg-yellow-50 p-3">
                <Icon className="size-6 text-yellow-500" />
            </div>
            <div>
                <p className="text-xs font-medium text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-800">{count}</p>
            </div>
        </div>
    );
}
