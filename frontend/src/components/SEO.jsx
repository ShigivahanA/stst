export default function SEO({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  ogUrl,
  canonicalPath,
  robots = 'index, follow'
}) {
  const siteName = 'Stat Surgicals'
  const fullTitle = title ? `${title} | ${siteName}` : siteName
  const currentUrl = ogUrl || window.location.href
  const defaultDescription = 'Stat Surgicals is your premium, one-stop destination for high-quality surgical tools, instruments, and equipment in India.'
  const defaultKeywords = 'surgical tools, medical instruments, surgical supplies, healthcare equipment, sterile instruments, surgery'
  const defaultOgImage = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200'

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={Array.isArray(keywords) ? keywords.join(', ') : keywords || defaultKeywords} />
      <meta name="robots" content={robots} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || description || defaultDescription} />
      <meta property="og:image" content={ogImage || defaultOgImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle || fullTitle} />
      <meta name="twitter:description" content={ogDescription || description || defaultDescription} />
      <meta name="twitter:image" content={ogImage || defaultOgImage} />

      {/* Canonical Link */}
      {canonicalPath && (
        <link rel="canonical" href={`${window.location.origin}${canonicalPath}`} />
      )}
    </>
  )
}
