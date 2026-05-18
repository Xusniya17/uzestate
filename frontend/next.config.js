const { i18n } = require("./next-i18next.config");

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  images: {
    domains: ["localhost", "s3.amazonaws.com", "uzestate-files.s3.amazonaws.com"],
  },
};

module.exports = nextConfig;
