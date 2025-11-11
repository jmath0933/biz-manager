const path = require("path");

module.exports = {
  reactStrictMode: true,

  // ⚙️ 절대경로 alias 보조 설정 (Vercel 대비용)
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname);
    return config;
  },
};
