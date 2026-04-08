type ModeratorListContainerProps = {
    children: React.ReactNode;
    isEmpty: boolean;
    emptyMessage: string;
    className?: string;
};

export function ModeratorListContainer({ children, isEmpty, emptyMessage, className }: ModeratorListContainerProps) {
    return (
        <div className={`
            rounded-b-xl border border-t-0 bg-white shadow-sm
            ${className ?? ""}
        `}>
            {isEmpty ? <p className="py-16 text-center text-sm text-gray-400">{emptyMessage}</p> : children}
        </div>
    );
}
