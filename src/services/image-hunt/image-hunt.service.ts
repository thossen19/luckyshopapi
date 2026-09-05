import axios from 'axios';
import * as crypto from 'crypto';

interface ImageResult {
  url: string;
  source: string;
  title: string;
  width: number;
  height: number;
}

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

const FALLBACK_URL = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=800&fit=crop';

const BLACKLIST_DOMAINS = [
  'pinterest.com', 'instagram.com', 'facebook.com', 'twitter.com', 'tiktok.com',
  'youtube.com', 'reddit.com', 'quora.com', 'linkedin.com',
  'wallpaperaccess.com', 'wallpaperflare.com', 'wallpapers.com',
  'shutterstock.com', 'gettyimages.com', 'istockphoto.com', 'dreamstime.com',
];

const SHOP_DOMAINS = ['amazon', 'walmart', 'target', 'instacart', 'chaldal', 'bigbasket', 'jmart', 'shwapno', 'meena', 'komodaa', 'pansari'];

const SKIP_PATTERNS = ['logo', 'icon', 'favicon', 'sprite', 'pixel', 'spacer', 'blank', 'avatar', 'badge'];
const VALID_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'];

class ImageHuntService {
  async hunt(query: string, countryCode: string = 'US', count: number = 12): Promise<ImageResult[]> {
    const cacheKey = `img_hunt_v1_${crypto.createHash('md5').update(query + countryCode + count).digest('hex')}`;
    
    // Check cache
    const cacheKeyHash = crypto.createHash('md5').update(cacheKey).digest('hex');
    const cached = await this.getCache(cacheKeyHash);
    if (cached) return cached;

    const allResults: ImageResult[] = [];
    const seen = new Set<string>();

    const queries = this.buildSearchQueries(query);

    for (const q of queries) {
      if (allResults.length >= count * 3) break;

      // Try Bing standard search
      const bingResults = await this.bingSearch(q, count * 2);
      for (const item of bingResults) {
        const key = crypto.createHash('md5').update(item.url).digest('hex');
        if (!seen.has(key) && this.isValidImageUrl(item.url)) {
          allResults.push(item);
          seen.add(key);
        }
      }

      // Try Bing async endpoint
      const asyncResults = await this.bingAsyncSearch(q, count);
      for (const item of asyncResults) {
        const key = crypto.createHash('md5').update(item.url).digest('hex');
        if (!seen.has(key) && this.isValidImageUrl(item.url)) {
          allResults.push(item);
          seen.add(key);
        }
      }
    }

    // Score and rank by relevance
    const scored = this.scoreRelevance(allResults, query);
    scored.sort((a, b) => b.score - a.score);

    const verified: ImageResult[] = [];
    for (const item of scored) {
      if (verified.length >= count) break;
      verified.push({
        url: item.url,
        source: item.source,
        title: item.title,
        width: item.width || 0,
        height: item.height || 0,
      });
    }

    if (verified.length === 0) {
      verified.push({
        url: FALLBACK_URL,
        source: 'Stock',
        title: query,
        width: 800,
        height: 800,
      });
    }

    // Cache for 1 hour
    await this.setCache(cacheKeyHash, verified, 3600);

    return verified;
  }

  private buildSearchQueries(query: string): string[] {
    const clean = query.trim().replace(/\s+/g, ' ');
    const words = clean.split(' ');
    const queries: string[] = [];

    queries.push(clean);
    queries.push(`${clean} photo`);

    if (words.length > 2) {
      queries.push(words.slice(0, 3).join(' '));
    }

    const stopWords = ['the', 'and', 'for', 'with', '1l', '2l', '500ml', '1kg', '2kg', '5kg', '10kg'];
    const coreWords = words.filter(w => w.length > 2 && !stopWords.includes(w.toLowerCase()));
    if (coreWords.length > 1) {
      queries.push(coreWords.slice(0, 3).join(' '));
    }

    return [...new Set(queries)];
  }

  private async bingSearch(query: string, count: number): Promise<ImageResult[]> {
    const results: ImageResult[] = [];

    const params = new URLSearchParams({
      q: query,
      cc: 'US',
      setlang: 'en',
      mkt: 'en-US',
      first: '1',
      count: String(Math.min(count, 50)),
    });

    const url = `https://www.bing.com/images/search?${params.toString()}`;

    try {
      const response = await axios.get(url, {
        headers: DEFAULT_HEADERS,
        timeout: 15000,
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
      });

      if (response.status === 200) {
        return this.parseBingHtml(response.data, count);
      }
    } catch (e) {
      // silent
    }

    return results;
  }

  private async bingAsyncSearch(query: string, count: number): Promise<ImageResult[]> {
    const results: ImageResult[] = [];

    try {
      const response = await axios.get('https://www.bing.com/images/async', {
        params: {
          q: query,
          first: 0,
          count: Math.min(count, 50),
          mmasync: 1,
        },
        headers: {
          ...DEFAULT_HEADERS,
          'Referer': 'https://www.bing.com/images/search',
          'X-Requested-With': 'XMLHttpRequest',
        },
        timeout: 15000,
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
      });

      if (response.status === 200) {
        return this.parseBingHtml(response.data, count);
      }
    } catch (e) {
      // silent
    }

    return results;
  }

  private parseBingHtml(html: string, count: number): ImageResult[] {
    const results: ImageResult[] = [];

    const regex = /<a[^>]*class="[^"]*iusc[^"]*"[^>]*m="([^"]+)"/gi;
    let match;

    while ((match = regex.exec(html)) !== null) {
      if (results.length >= count) break;

      const encoded = match[1];
      const json = this.decodeHtmlEntities(encoded);
      
      try {
        const data = JSON.parse(json);
        if (!data || !data.murl) continue;

        results.push({
          url: data.murl,
          source: this.extractSourceDomain(data.purl || '', data.p || ''),
          title: data.t || '',
          width: data.mw || 0,
          height: data.mh || 0,
        });
      } catch {
        continue;
      }
    }

    return results;
  }

  private decodeHtmlEntities(str: string): string {
    return str
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
  }

  private scoreRelevance(items: ImageResult[], query: string): (ImageResult & { score: number })[] {
    const queryWords = query.split(' ').filter(w => w.length > 1).map(w => w.toLowerCase());

    return items.map(item => {
      let score = 0;
      const title = (item.title || '').toLowerCase();
      const source = (item.source || '').toLowerCase();
      const url = item.url.toLowerCase();

      // Strong penalty for blacklisted domains
      for (const bl of BLACKLIST_DOMAINS) {
        if (source.includes(bl) || url.includes(bl)) {
          score -= 50;
        }
      }

      // Bonus for title matching query words
      for (const w of queryWords) {
        if (title.includes(w)) score += 5;
      }

      // Bonus for source being a shopping/grocery site
      for (const sd of SHOP_DOMAINS) {
        if (source.includes(sd) || url.includes(sd)) {
          score += 15;
        }
      }

      // Bonus for product-like dimensions (roughly square or 4:3)
      if ((item.width || 0) > 0 && (item.height || 0) > 0) {
        const ratio = item.width / Math.max(1, item.height);
        if (ratio >= 0.7 && ratio <= 1.5) score += 3;
      }

      // Small bonus for having a meaningful title
      if (title.length > 5 && title.length < 200) score += 1;

      return { ...item, score };
    });
  }

  private extractSourceDomain(purl: string, pname: string): string {
    if (purl) {
      try {
        const url = new URL(purl);
        return url.hostname.replace(/^www\./, '');
      } catch {
        // invalid url
      }
    }
    return pname || 'Bing';
  }

  private isValidImageUrl(url: string): boolean {
    const lower = url.toLowerCase();
    
    if (lower.includes('data:image')) return false;
    if (lower.includes('.svg')) return false;

    for (const s of SKIP_PATTERNS) {
      if (lower.includes(s)) return false;
    }

    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const ext = path.split('.').pop()?.toLowerCase() || '';
      
      if (ext && !VALID_EXTENSIONS.includes(ext)) {
        return false;
      }
    } catch {
      return false;
    }

    return true;
  }

  private async getCache(key: string): Promise<ImageResult[] | null> {
    // Simple in-memory cache since we don't have Redis
    const cache = (global as any).__imageHuntCache || {};
    const item = cache[key];
    if (item && item.expires > Date.now()) {
      return item.data;
    }
    return null;
  }

  private async setCache(key: string, data: ImageResult[], ttl: number): Promise<void> {
    if (!(global as any).__imageHuntCache) {
      (global as any).__imageHuntCache = {};
    }
    (global as any).__imageHuntCache[key] = {
      data,
      expires: Date.now() + (ttl * 1000),
    };
  }
}

export const imageHuntService = new ImageHuntService();
