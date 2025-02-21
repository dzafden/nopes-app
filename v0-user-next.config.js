/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // This will make sure our JS files are served with the correct MIME type
    config.module.rules.push({
      test: /\.js$/,
      type: "javascript/auto",
      resolve: {
        fullySpecified: false,
      },
    })

    return config
  },
}

module.exports = nextConfig

