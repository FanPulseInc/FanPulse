export const SportContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="w-full bg-background min-h-screen">
            <div className="w-full">
                {children}
            </div>
        </div>
    );
};
