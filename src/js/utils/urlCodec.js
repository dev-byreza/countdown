/**
 * URL State Encoder & Decoder for Shareable Countdowns
 */

export function encodeTimerToUrl(timer) {
  try {
    const payload = {
      t: timer.title,
      d: timer.targetDate,
      th: timer.theme || 'cosmic',
      m: timer.displayMode || 'flip',
      s: timer.tickSound || 'mechanical',
      a: timer.ambientSound || 'none'
    };
    const jsonStr = JSON.stringify(payload);
    // Safe UTF-8 to Base64
    const base64 = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
    
    const url = new URL(window.location.href);
    url.hash = `c=${base64}`;
    return url.toString();
  } catch (e) {
    console.error('Failed to encode timer URL:', e);
    return window.location.href;
  }
}

export function decodeTimerFromUrl() {
  try {
    const hash = window.location.hash;
    if (!hash || !hash.includes('c=')) return null;

    const base64Part = hash.split('c=')[1].split('&')[0];
    if (!base64Part) return null;

    const decodedStr = decodeURIComponent(Array.prototype.map.call(atob(base64Part), (c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(decodedStr);

    return {
      id: 'shared_' + Date.now(),
      title: payload.t || 'Shared Countdown Event',
      targetDate: payload.d || new Date(Date.now() + 86400000).toISOString(),
      theme: payload.th || 'cosmic',
      displayMode: payload.m || 'flip',
      tickSound: payload.s || 'mechanical',
      ambientSound: payload.a || 'none',
      isShared: true
    };
  } catch (e) {
    console.warn('Could not parse share URL params:', e);
    return null;
  }
}
