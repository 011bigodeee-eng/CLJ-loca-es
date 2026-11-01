import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  images: {
    // Current illustrative sources are 1536px wide. Do not request artificial 4K variants.
    deviceSizes: [320, 390, 640, 750, 828, 1080, 1280, 1536],
    imageSizes: [48, 64, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
  },
};
export default config;
