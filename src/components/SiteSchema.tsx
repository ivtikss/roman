import { indexable, siteDescription, siteTitle, siteUrl } from "@/lib/site-config";

export function SiteSchema() {
  if (!indexable || !siteUrl) return null;

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: "Карамельная линия",
        inLanguage: "ru-RU",
      },
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage`,
        url: `${siteUrl}/`,
        name: siteTitle,
        description: siteDescription,
        inLanguage: "ru-RU",
        isPartOf: { "@id": `${siteUrl}/#website` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${siteUrl}/assets/og-caramel.jpg`,
          width: 1200,
          height: 630,
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
    />
  );
}
