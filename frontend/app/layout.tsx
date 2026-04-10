import React from "react";
import QueryProvider from "@/providers/QueryProvider";

export default function RootGlobalLayout({children
}: { children: React.ReactNode
}) {
    return (
        <html lang="uk">
        <body>
        <QueryProvider>
            {children}
        </QueryProvider>
        </body>
        </html>
    );
}