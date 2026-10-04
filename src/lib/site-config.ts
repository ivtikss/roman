const configuredUrl = process.env.SITE_URL?.trim();

function getSiteUrl() {
  if (!configuredUrl) return null;

  const url = new URL(configuredUrl);
  if (
    url.protocol !== "https:" ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  ) {
    throw new Error("SITE_URL must be a public HTTPS origin without a path or credentials.");
  }

  return url.origin;
}

export const siteUrl = getSiteUrl();
export const indexable = siteUrl !== null && process.env.SITE_INDEXABLE === "true";

export const siteTitle = "Линия для карамели с начинкой | Карамельная линия";
export const siteDescription =
  "Малая автоматизированная линия для производства леденцовой карамели с мягкой начинкой: два бункера, коэкструзия, конвейер и формообразующие колеса.";
