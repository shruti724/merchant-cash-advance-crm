/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The API base URL is read at runtime via NEXT_PUBLIC_API_URL (see .env.example)
  // so the same build can point at different backend deployments.
};

export default nextConfig;
