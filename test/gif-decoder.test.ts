/**
 * gif-decoder unit tests.
 *
 * The decoder now routes fetches through chrome.runtime.sendMessage
 * to the service worker. These tests mock that messaging.
 */

import { decodeGif } from '../src/content/gif-decoder';

// Mock chrome.runtime.sendMessage
const mockSendMessage = jest.fn();
(global as any).chrome = {
  runtime: {
    sendMessage: mockSendMessage,
    lastError: null,
  },
};

describe('gif-decoder', () => {
  afterEach(() => {
    mockSendMessage.mockReset();
    (global as any).chrome.runtime.lastError = null;
  });

  it('should reject when service worker returns an error', async () => {
    mockSendMessage.mockImplementation((_msg: any, callback: any) => {
      callback({ ok: false, error: 'HTTP 404 Not Found' });
    });

    await expect(decodeGif('https://example.com/missing.gif')).rejects.toThrow(
      'HTTP 404 Not Found'
    );
  });

  it('should reject on chrome.runtime.lastError', async () => {
    mockSendMessage.mockImplementation((_msg: any, callback: any) => {
      (global as any).chrome.runtime.lastError = {
        message: 'Extension context invalidated',
      };
      callback(undefined);
    });

    await expect(decodeGif('https://example.com/test.gif')).rejects.toThrow(
      'Extension context invalidated'
    );
  });

  it('should send FETCH_GIF message with the correct URL', async () => {
    mockSendMessage.mockImplementation((_msg: any, callback: any) => {
      callback({ ok: false, error: 'test abort' });
    });

    try {
      await decodeGif('https://example.com/test.gif');
    } catch {
      // expected
    }

    expect(mockSendMessage).toHaveBeenCalledWith(
      { type: 'FETCH_GIF', url: 'https://example.com/test.gif' },
      expect.any(Function)
    );
  });
});
