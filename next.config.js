/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {}, // ✅ Turbopack 설정을 명시적으로 비워서 오류 제거
  webpack: (config) => {
    config.externals.push({
      "tesseract.js": "commonjs tesseract.js",
    });
    return config;
  },
};

module.exports = nextConfig;
