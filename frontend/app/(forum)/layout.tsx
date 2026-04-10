import React from "react";
import ForumHeader from "../_components/_forum/ForumHeader";
import { ForumContainer } from "../_components/_forum/ForumContainer";

export default function ForumLayout({
                                        children
                                    }: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <ForumHeader />
            <ForumContainer>
                <div className="flex gap-6 items-start">
                    <div className="flex-1">
                        {children}
                    </div>

                    <aside className="hidden lg:block w-[300px] bg-white rounded-[20px] shadow-sm h-fit p-6 border border-gray-100 sticky top-24">
                        <h2 className="font-bold text-[#af292a] mb-4 uppercase text-sm">
                            Top Match Discussions
                        </h2>
                        <div className="text-gray-400 text-xs italic">
                            Widgets will go here...
                        </div>
                    </aside>
                </div>
            </ForumContainer>
        </div>
    );
}