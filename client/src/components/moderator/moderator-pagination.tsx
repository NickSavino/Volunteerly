import { ChevronLeft, ChevronRight } from "lucide-react";

type ModeratorPaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number | ((prev: number) => number)) => void;
};

export function ModeratorPagination({ currentPage, totalPages, onPageChange }: ModeratorPaginationProps) {
    return (
        <div className="flex items-center gap-2">
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange((p: number) => p - 1)}
                className="
                    rounded-md border p-1.5
                    hover:bg-gray-100
                    disabled:opacity-40
                "
            >
                <ChevronLeft className="size-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`
                        size-8 rounded-md text-sm font-medium
                        ${page === currentPage ? "bg-yellow-400 text-black" : "border text-gray-600 hover:bg-gray-100"}
                    `}
                >
                    {page}
                </button>
            ))}

            <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange((p: number) => p + 1)}
                className="
                    rounded-md border p-1.5
                    hover:bg-gray-100
                    disabled:opacity-40
                "
            >
                <ChevronRight className="size-4" />
            </button>
        </div>
    );
}
