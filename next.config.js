const path = require("path");

module.exports = {
  reactStrictMode: true,

  // ⚙️ 절대경로 alias 및 pdf-parse 설정
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname);
    config.resolve.alias.canvas = false; // pdf-parse 오류 방지
    return config;
  },

  // ✅ pdf-parse를 서버 컴포넌트 외부 패키지로 처리
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },

  // ✅ Turbopack 대응 (Next.js 16용)
  turbopack: {},
};