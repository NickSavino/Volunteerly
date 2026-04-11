/**
 * moderator-page-header.tsx
 * Renders a consistent header for moderator pages.
 */

type ModeratorPageHeaderProps = {
    title: string;
    subtitle: string;
};

export function ModeratorPageHeader({ title, subtitle }: ModeratorPageHeaderProps) {
    return (
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
    );
}
