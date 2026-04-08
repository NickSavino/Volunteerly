import { LucideIcon } from "lucide-react";

type OrgStatCardProps = {
    icon: LucideIcon;
    label: string;
    money: boolean;
    count: number;
};

export function OrgStatCard({ icon: Icon, label, count, money }: OrgStatCardProps) {
    return (
        <div
            className="
            my-3 flex items-center gap-4 rounded-xl border bg-white p-5 shadow-sm
            md:my-0
        "
        >
            <div className="rounded-md bg-yellow-50 p-3">
                <Icon className="size-6 text-yellow-500" />
            </div>
            <div>
                <p className="text-xs font-medium text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-800">
                    {money && "$"}
                    {count}
                </p>
            </div>
        </div>
    );
}
