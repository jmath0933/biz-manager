const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",

  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname);
    config.resolve.alias["@lib"] = path.resolve(__dirname, "lib");
    config.resolve.alias["@components"] = path.resolve(__dirname, "components");
    config.resolve.alias["@utils"] = path.resolve(__dirname, "utils");
    config.resolve.alias.canvas = false;

    // Ensure .ts/.tsx are resolved by webpack/turbopack
    config.resolve.extensions = [
      ...(config.resolve.extensions || []),
      ".ts",
      ".tsx",
      ".js",
      ".jsx",
      ".json"
    ];

    return config;
  },

  // Next 16+: move serverComponentsExternalPackages out of experimental
  serverExternalPackages: [
    "pdf-parse",
    "firebase",
    "firebase-admin",
    "firebase/app",
    "firebase/firestore",
    "axios",
  ],

  turbopack: {},
};

module.exports = nextConfig;