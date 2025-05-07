/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["image.tmdb.org", "yts.mx"],
    minimumCacheTTL: 604800, // Cache optimized images for 7 days
  },
}

export default nextConfig
