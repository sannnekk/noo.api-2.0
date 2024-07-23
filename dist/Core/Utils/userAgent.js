export function parseUserAgent(userAgent) {
    const browserRegex = /(firefox|msie|chrome|safari|trident|opera)/i;
    const osRegex = /(windows|macintosh|android|linux|iphone|ipad)/i;
    const deviceRegex = /(tablet|ipad|mobile|iphone|android)/i;
    const browserMatch = userAgent.match(browserRegex);
    const osMatch = userAgent.match(osRegex);
    const deviceMatch = userAgent.match(deviceRegex);
    const browser = browserMatch ? browserMatch[0] : 'Unknown Browser';
    const os = osMatch ? osMatch[0] : 'Unknown OS';
    const device = deviceMatch ? deviceMatch[0] : 'Unknown Device';
    // Normalize some values
    const normalizedBrowser = browser.toLowerCase() === 'trident' ? 'Internet Explorer' : browser;
    const normalizedOS = os.toLowerCase() === 'macintosh' ? 'macOS' : os;
    return {
        browser: normalizedBrowser,
        os: normalizedOS,
        device,
    };
}
