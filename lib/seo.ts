import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/utils";

type SeoOptions = {
  title: string;
  description: string;
  path?: string;
  image?: string;
};

export function buildMetadata({ title, description, path = "/", image = "/og-default.svg" }: SeoOptions): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "NexaBlog",
      type: "article",
      images: [
        {
          url: image.startsWith("http") ? image : absoluteUrl(image),
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.startsWith("http") ? image : absoluteUrl(image)]
    }
  };
}

