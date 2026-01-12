/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: '/api/analyze',
                destination: 'http://localhost:8000/api/analyze',
            },
        ];
    },
};

export default nextConfig;
