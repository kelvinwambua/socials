

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  webpack: (config) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!Array.isArray(config.externals)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      config.externals = [];
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil"
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/socket/:path*',
        destination: '/_next/socket/:path*',
      },
    ];
  },
  images: {
    domains: ["utfs.io","unsplash.com","source.unsplash.com","example.com","github.com"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        pathname: '/a/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/a/**',
      },
    ],
  },
};

export default config;