import { findUnprocessedGifs, markAsProcessed, isProcessed, createDOMObserver } from '../src/content/gif-detector';

describe('gif-detector', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('findUnprocessedGifs', () => {
    it('should find GIF images inside <animated-image> elements', () => {
      document.body.innerHTML = `
        <div class="markdown-body">
          <animated-image>
            <a><img src="https://example.com/demo.gif?jwt=abc123" data-target="animated-image.originalImage" alt="demo" /></a>
          </animated-image>
          <animated-image>
            <a><img src="https://example.com/other.gif?jwt=xyz789" data-target="animated-image.originalImage" alt="other" /></a>
          </animated-image>
        </div>
      `;

      const targets = findUnprocessedGifs();
      expect(targets).toHaveLength(2);
      expect(targets[0].src).toContain('demo.gif');
      expect(targets[0].alt).toBe('demo');
      expect(targets[1].src).toContain('other.gif');
    });

    it('should find standalone GIF images with query params in src', () => {
      document.body.innerHTML = `
        <div class="markdown-body">
          <img src="https://example.com/standalone.gif?token=abc" alt="standalone" />
          <img src="https://example.com/photo.png" />
        </div>
      `;

      const targets = findUnprocessedGifs();
      expect(targets).toHaveLength(1);
      expect(targets[0].src).toContain('standalone.gif');
    });

    it('should not duplicate GIFs that are inside <animated-image>', () => {
      document.body.innerHTML = `
        <div class="markdown-body">
          <animated-image>
            <a><img src="https://example.com/wrapped.gif?jwt=abc" data-target="animated-image.originalImage" alt="wrapped" /></a>
          </animated-image>
        </div>
      `;

      const targets = findUnprocessedGifs();
      expect(targets).toHaveLength(1);
      expect(targets[0].replaceTarget.tagName.toLowerCase()).toBe('animated-image');
    });

    it('should ignore GIFs outside .markdown-body', () => {
      document.body.innerHTML = `
        <div>
          <img src="https://example.com/outside.gif" />
        </div>
        <div class="markdown-body">
          <img src="https://example.com/inside.gif" alt="inside" />
        </div>
      `;

      const targets = findUnprocessedGifs();
      expect(targets).toHaveLength(1);
      expect(targets[0].src).toContain('inside.gif');
    });

    it('should ignore already processed elements', () => {
      document.body.innerHTML = `
        <div class="markdown-body">
          <animated-image data-gif-ctrl="done">
            <a><img src="https://example.com/processed.gif" data-target="animated-image.originalImage" /></a>
          </animated-image>
          <img src="https://example.com/new.gif" alt="new" />
        </div>
      `;

      const targets = findUnprocessedGifs();
      expect(targets).toHaveLength(1);
      expect(targets[0].src).toContain('new.gif');
    });

    it('should return empty array when no GIFs are present', () => {
      document.body.innerHTML = `
        <div class="markdown-body">
          <img src="https://example.com/photo.png" />
          <p>No GIFs here</p>
        </div>
      `;

      const targets = findUnprocessedGifs();
      expect(targets).toHaveLength(0);
    });
  });

  describe('markAsProcessed / isProcessed', () => {
    it('should mark an element as processed', () => {
      const el = document.createElement('animated-image');
      expect(isProcessed(el)).toBe(false);

      markAsProcessed(el, 'done');
      expect(isProcessed(el)).toBe(true);
      expect(el.getAttribute('data-gif-ctrl')).toBe('done');
    });

    it('should mark with custom status', () => {
      const el = document.createElement('div');
      markAsProcessed(el, 'error');
      expect(el.getAttribute('data-gif-ctrl')).toBe('error');
    });
  });

  describe('createDOMObserver', () => {
    it('should call callback when new nodes are added', (done) => {
      const callback = jest.fn(() => {
        expect(callback).toHaveBeenCalled();
        done();
      });

      createDOMObserver(callback);

      const div = document.createElement('div');
      document.body.appendChild(div);
    });
  });
});
