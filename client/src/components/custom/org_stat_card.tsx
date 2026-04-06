import { LucideIcon } from "lucide-react";

type OrgStatCardProps = {
    icon: LucideIcon;
    label: string;
    money: boolean;
    count: number;
};

export function OrgStatCard({ icon: Icon, label, count, money }: OrgStatCardProps) {
    return (
        <div className='flex items-center gap-4 rounded-xl border bg-white p-5 shadow-sm my-3 md:my-0'>
            <div className="rounded-md bg-yellow-50 p-3">
                <Icon className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
                <p className="text-xs font-medium text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-800">{money && "$"}{count}</p>
            </div>
        </div>
    );
}
