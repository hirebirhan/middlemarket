/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dev only: lets a browser running in a container reach this dev server by
  // host name. Without it Next blocks the cross-origin dev requests and the
  // client runtime never hydrates.
  allowedDevOrigins: ["host.docker.internal"],
  output: "standalone",
};

export default nextConfig;
