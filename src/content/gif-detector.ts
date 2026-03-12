const PROCESSED_ATTR = 'data-gif-ctrl';

// GitHub wraps GIFs in <animated-image> custom elements
const ANIMATED_IMAGE_SELECTOR =
  '.markdown-body animated-image:not([data-gif-ctrl])';

// Fallback: standalone <img> whose src contains ".gif" (covers .gif?jwt=…)
const STANDALONE_GIF_SELECTOR =
  '.markdown-body img[src*=".gif"]:not([data-gif-ctrl])';

export interface GifTarget {
  /** The element to replace in the DOM (animated-image or img) */
  replaceTarget: Element;
  /** The GIF image URL */
  src: string;
  /** Alt text from the original image */
  alt: string;
}

export function findUnprocessedGifs(): GifTarget[] {
  const targets: GifTarget[] = [];

  // 1. GitHub <animated-image> elements (primary path)
  const animatedImages = document.querySelectorAll<HTMLElement>(
    ANIMATED_IMAGE_SELECTOR
  );

  for (const el of animatedImages) {
    const img =
      el.querySelector<HTMLImageElement>(
        'img[data-target="animated-image.originalImage"]'
      ) ??
      el.querySelector<HTMLImageElement>('img[src*=".gif"]');

    if (img?.src) {
      targets.push({
        replaceTarget: el,
        src: img.src,
        alt: img.alt || '',
      });
    }
  }

  // 2. Standalone <img> tags not inside an <animated-image>
  const standaloneImgs = document.querySelectorAll<HTMLImageElement>(
    STANDALONE_GIF_SELECTOR
  );

  for (const img of standaloneImgs) {
    if (img.closest('animated-image')) continue;

    targets.push({
      replaceTarget: img,
      src: img.src,
      alt: img.alt || '',
    });
  }

  return targets;
}

export function markAsProcessed(
  el: Element,
  status: 'processing' | 'done' | 'error' = 'done'
): void {
  el.setAttribute(PROCESSED_ATTR, status);
}

export function isProcessed(el: Element): boolean {
  return el.hasAttribute(PROCESSED_ATTR);
}

export function createDOMObserver(onNewGifs: () => void): MutationObserver {
  const observer = new MutationObserver((mutations) => {
    const hasNewNodes = mutations.some((m) => m.addedNodes.length > 0);

    if (hasNewNodes) {
      onNewGifs();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return observer;
}

export function listenForTurboNavigation(onNavigate: () => void): void {
  document.addEventListener('turbo:load', onNavigate);
  document.addEventListener('turbo:render', onNavigate);
}
