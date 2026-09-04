import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Revollution Lastro",
    short_name: "Lastro",
    description: "Prova de anterioridade de imagens e acompanhamento de processos do INPI.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f7f3ee",
    theme_color: "#4c0c23",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
