import { describe, it, expect } from 'vitest';
import { parseYouTubeUrl } from '../src/constants/music';

describe('YouTube Music URL Parser', () => {
  it('parses standard desktop YouTube watch URLs', () => {
    const result = parseYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('video');
    expect(result?.id).toBe('dQw4w9WgXcQ');
    expect(result?.videoId).toBe('dQw4w9WgXcQ');
    expect(result?.embedUrl).toContain('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('parses YouTube Music URLs', () => {
    const result = parseYouTubeUrl('https://music.youtube.com/watch?v=5qap5aO4i9A');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('video');
    expect(result?.id).toBe('5qap5aO4i9A');
  });

  it('parses shortened youtu.be links', () => {
    const result = parseYouTubeUrl('https://youtu.be/5qap5aO4i9A');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('video');
    expect(result?.id).toBe('5qap5aO4i9A');
  });

  it('parses pure playlist URLs', () => {
    const result = parseYouTubeUrl('https://www.youtube.com/playlist?list=PLw-VjHDlEOgs658kAHR_LAa4504HmZ8Or');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('playlist');
    expect(result?.id).toBe('PLw-VjHDlEOgs658kAHR_LAa4504HmZ8Or');
    expect(result?.videoId).toBeNull();
    expect(result?.embedUrl).toContain('videoseries?list=PLw-VjHDlEOgs658kAHR_LAa4504HmZ8Or');
  });

  it('parses video links with an associated playlist parameter', () => {
    const result = parseYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLw-VjHDlEOgs658kAHR_LAa4504HmZ8Or');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('playlist');
    expect(result?.id).toBe('PLw-VjHDlEOgs658kAHR_LAa4504HmZ8Or');
    expect(result?.videoId).toBe('dQw4w9WgXcQ');
    expect(result?.embedUrl).toContain('embed/dQw4w9WgXcQ?list=PLw-VjHDlEOgs658kAHR_LAa4504HmZ8Or');
  });

  it('parses YouTube Shorts URLs', () => {
    const result = parseYouTubeUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('video');
    expect(result?.id).toBe('dQw4w9WgXcQ');
  });

  it('parses raw 11-character video IDs', () => {
    const result = parseYouTubeUrl('dQw4w9WgXcQ');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('video');
    expect(result?.id).toBe('dQw4w9WgXcQ');
  });

  it('returns null for empty, null, or invalid URLs', () => {
    expect(parseYouTubeUrl('')).toBeNull();
    expect(parseYouTubeUrl('   ')).toBeNull();
    expect(parseYouTubeUrl(null)).toBeNull();
    expect(parseYouTubeUrl(undefined)).toBeNull();
    expect(parseYouTubeUrl('https://google.com')).toBeNull();
    expect(parseYouTubeUrl('spotify:track:4cOdK2wGLETKBW3PvgPWqT')).toBeNull();
  });
});
