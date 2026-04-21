import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        // TheSportsDB serves team/league badges and player cutouts from these hosts.
        // Whitelisted so we can use <Image /> instead of plain <img>.
        remotePatterns: [
            { protocol: "https", hostname: "www.thesportsdb.com" },
            { protocol: "https", hostname: "r2.thesportsdb.com" },
            { protocol: "https", hostname: "**.thesportsdb.com" },
        ],
    },
};

export default nextConfig;
