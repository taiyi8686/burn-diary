/** @type {import('next').NextConfig} */
const isGHPages = process.env.DEPLOY_TARGET === "gh-pages";

const nextConfig = {
  output: "export",
  basePath: isGHPages ? "/burn-diary" : "",
  assetPrefix: isGHPages ? "/burn-diary/" : "",
};

export default nextConfig;
