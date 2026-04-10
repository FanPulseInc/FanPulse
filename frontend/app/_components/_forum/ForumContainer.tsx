export const ForumContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="w-full bg-[#f8f8f8] py-10 min-h-screen">
            <div className="max-w-[1039px] mx-auto px-4">
                {children}
            </div>
        </div>
    );
};