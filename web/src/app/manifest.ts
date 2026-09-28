import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SOIL — The Innovators",
    short_name: "SOIL",
    description: "Multi-tenant institute management platform",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f0ede4",
    theme_color: "#004741",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
