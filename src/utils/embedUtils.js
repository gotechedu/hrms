/**
 * Transforms document, PDF, drive, and video URLs into reliable embeddable iframe URLs
 */
export function getEmbeddableUrl(url, preferredMode = 'auto') {
  if (!url) return '';
  const cleanUrl = url.trim();

  // 1. YouTube URLs
  if (cleanUrl.includes('youtube.com/watch?v=')) {
    const videoId = cleanUrl.split('watch?v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}?rel=0`;
  }
  if (cleanUrl.includes('youtu.be/')) {
    const videoId = cleanUrl.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}?rel=0`;
  }

  // 2. Google Drive preview URLs
  if (cleanUrl.includes('drive.google.com/file/d/')) {
    const match = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }

  // 3. Google Docs / Sheets / Slides preview URLs
  if (cleanUrl.includes('docs.google.com/') && (cleanUrl.includes('/edit') || cleanUrl.includes('/view'))) {
    return cleanUrl.replace(/\/edit(\?.*)?$/, '/preview').replace(/\/view(\?.*)?$/, '/preview');
  }

  // 4. Force native if requested
  if (preferredMode === 'native') {
    return cleanUrl;
  }

  // 5. PDFs or office documents from external domains
  const isPdf = cleanUrl.toLowerCase().endsWith('.pdf') || cleanUrl.toLowerCase().includes('.pdf?');
  const isOfficeDoc = /\.(docx?|pptx?|xlsx?|odt)(\?.*)?$/i.test(cleanUrl);

  if ((isPdf || isOfficeDoc) && (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://'))) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(cleanUrl)}&embedded=true`;
  }

  return cleanUrl;
}

export function isDocumentOrPdf(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.endsWith('.pdf') ||
    lower.includes('.pdf?') ||
    lower.includes('drive.google.com') ||
    lower.includes('docs.google.com') ||
    /\.(docx?|pptx?|xlsx?|odt)(\?.*)?$/i.test(lower)
  );
}
