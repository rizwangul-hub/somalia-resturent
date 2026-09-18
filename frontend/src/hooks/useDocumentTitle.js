import { useEffect } from 'react';

/**
 * Custom React hook to set document title for SEO and accessibility
 * Defaults back to 'AFLAX Restaurant' on unmount or when title is omitted
 */
export default function useDocumentTitle(title) {
  useEffect(() => {
    const originalTitle = document.title;
    if (title) {
      document.title = title;
    }
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}
