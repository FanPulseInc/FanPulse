export const SportContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="w-full bg-[#E6E6E6] min-h-screen">
            <div className="w-full">
                {children}
            </div>
        </div>
    );
};
