const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone", // ✅ Vercel 배포 시 서버 런타임 보장

  // ⚙️ 절대경로 alias 및 pdf-parse 설정
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname);
    config.resolve.alias.canvas = false; // ✅ pdf-parse canvas 의존성 제거
    return config;
  },

  experimental: {
    // ✅ 외부 패키지 인식 (Node 종속성 있는 패키지)
    serverComponentsExternalPackages: [
      "pdf-parse",
      "firebase",
      "firebase/app",
      "firebase/firestore",
      "axios",
    ],
  },

  // ✅ Turbopack 대응 (Next.js 15~16)
  turbopack: {},
};

module.exports = nextConfig;
