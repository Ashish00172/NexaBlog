import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/core";
import Image from "next/image";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Link from "@tiptap/extension-link";

type BlogContentProps = {
  content: JSONContent;
  coverImage: string;
  title: string;
  videoUrl?: string | null;
  media?: Array<{
    id: string;
    secureUrl: string;
    resource: string;
  }>;
};

const extensions = [StarterKit, ImageExtension, Youtube, Link.configure({ openOnClick: false })];

export function BlogContent({ content, coverImage, title, videoUrl, media = [] }: BlogContentProps) {
  const html = generateHTML(content, extensions);

  return (
    <article className="space-y-6">
      <div className="relative h-80 w-full overflow-hidden rounded-2xl">
        <Image
          src={coverImage}
          alt={title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {videoUrl ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-black">
          <iframe
            src={videoUrl}
            title={`${title} video`}
            className="h-[420px] w-full"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null}

      {media.length ? (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">Attached Media</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {media.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {item.resource === "video" ? (
                  <video controls className="h-56 w-full object-cover">
                    <source src={item.secureUrl} />
                  </video>
                ) : (
                  <div className="relative h-56 w-full">
                    <Image src={item.secureUrl} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="prose-content" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}

