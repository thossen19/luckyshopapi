import prisma from '../../config/database';
import { config } from '../../config';

export class AiService {
  private provider: string;
  private apiKey: string;
  private model: string;

  constructor() {
    this.provider = config.ai.provider;
    this.apiKey = config.ai.apiKey;
    this.model = config.ai.model;
  }

  async generateProductDescription(storeId: string, data: {
    productName: string;
    features: string[];
    specifications?: Record<string, string>;
    keywords?: string[];
    tone?: string;
  }) {
    const prompt = `Generate e-commerce product content for: ${data.productName}
Features: ${data.features.join(', ')}
${data.specifications ? `Specifications: ${JSON.stringify(data.specifications)}` : ''}
Keywords: ${data.keywords?.join(', ') || 'N/A'}
Tone: ${data.tone || 'professional, persuasive'}

Generate in JSON format:
{
  "description": "Full product description (150-300 words)",
  "shortDescription": "Brief 1-2 sentence description",
  "seoTitle": "SEO optimized title (50-60 chars)",
  "seoDescription": "Meta description (150-160 chars)",
  "highlights": ["key highlight 1", "key highlight 2", "key highlight 3"],
  "socialMediaCaptions": {
    "facebook": "Facebook post caption",
    "instagram": "Instagram caption with hashtags",
    "twitter": "Twitter post under 280 chars"
  }
}`;

    // Log AI usage
    const startTime = Date.now();
    const response = await this.callAI(prompt);
    const duration = Date.now() - startTime;

    await this.logUsage(storeId, {
      operation: 'product_description',
      inputTokens: prompt.length / 4,
      outputTokens: response.length / 4,
      prompt,
      response,
      duration,
    });

    try {
      return JSON.parse(response);
    } catch {
      return { description: response, shortDescription: response.substring(0, 200) };
    }
  }

  async generateSeoContent(storeId: string, data: {
    productName: string;
    category?: string;
    keywords?: string[];
  }) {
    const prompt = `Generate SEO content for: ${data.productName}
Category: ${data.category || 'General'}
Keywords: ${data.keywords?.join(', ')}

Return JSON:
{
  "metaTitle": "SEO title (50-60 chars)",
  "metaDescription": "Meta description (150-160 chars)",
  "slug": "seo-friendly-url-slug",
  "structuredData": { "@type": "Product", "name": "..." }
}`;

    const response = await this.callAI(prompt);
    try { return JSON.parse(response); } catch { return { metaTitle: data.productName, metaDescription: response.substring(0, 160) }; }
  }

  async chatAssistant(storeId: string, messages: { role: string; content: string }[], context?: any) {
    const systemPrompt = `You are an AI shopping assistant for ${context?.storeName || 'this store'}.
Help customers find products, answer questions about orders, and provide recommendations.
Be helpful, concise, and friendly. Respond with product suggestions when appropriate.
If asked about specific products, reference the store's catalog.`;

    const response = await this.callAI(
      messages.map((m) => `${m.role}: ${m.content}`).join('\n'),
      systemPrompt
    );

    return { response, suggestions: [] };
  }

  async getInsights(storeId: string) {
    const [topProducts, lowStock, recentOrders, revenueTrend] = await Promise.all([
      prisma.product.findMany({
        where: { storeId, deletedAt: null, status: 'ACTIVE' },
        include: { orderItems: { where: { order: { status: { notIn: ['CANCELLED'] } } }, select: { quantity: true, totalPrice: true } } },
        take: 50,
      }),
      prisma.product.findMany({
        where: { storeId, deletedAt: null, status: 'ACTIVE', trackInventory: true, stockQuantity: { lte: 5 } },
        take: 10,
      }),
      prisma.order.findMany({
        where: { storeId },
        include: { items: { select: { productName: true, quantity: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.$queryRaw`
        SELECT DATE(created_at) as date, SUM(total_amount) as revenue
        FROM orders WHERE store_id = ${storeId} AND status NOT IN ('CANCELLED')
        AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at) ORDER BY date ASC
      `,
    ]);

    const insights: string[] = [];

    if (lowStock.length > 0) {
      insights.push(`${lowStock.length} product(s) are running low on stock and may need restocking soon.`);
    }

    const totalRevenue = recentOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    insights.push(`Total revenue in recent period: $${totalRevenue.toFixed(2)} from ${recentOrders.length} orders.`);

    const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    for (const order of recentOrders) {
      for (const item of order.items) {
        if (!productSales[item.productName]) productSales[item.productName] = { name: item.productName, qty: 0, revenue: 0 };
        productSales[item.productName].qty += item.quantity;
      }
    }

    const sorted = Object.values(productSales).sort((a, b) => b.qty - a.qty);
    if (sorted.length > 0) {
      insights.push(`Top selling product: "${sorted[0].name}" with ${sorted[0].qty} units sold.`);
    }

    return { insights, lowStock, topProducts: sorted.slice(0, 5), revenueTrend };
  }

  async generateProductContent(data: {
    productName: string;
    category?: string;
    brand?: string;
  }) {
    const context = [data.productName, data.category, data.brand].filter(Boolean).join(', ');
    
    const shortDescription = `${data.productName} is a premium quality product${data.category ? ` in the ${data.category} category` : ''}${data.brand ? ` from ${data.brand}` : ''}. Designed with excellence in mind, it delivers exceptional value and performance.`;
    
    const description = `# ${data.productName}

${data.productName} represents the perfect blend of quality, innovation, and value${data.brand ? ` from the trusted brand ${data.brand}` : ''}. Whether you're looking for reliability, style, or performance, this product delivers on all fronts.

## Key Benefits

- **Premium Quality**: Crafted with attention to detail and superior materials
- **Exceptional Value**: Competitive pricing without compromising on quality
- **Versatile Use**: Perfect for everyday use and special occasions
- **Customer Satisfaction**: Backed by our commitment to excellence

## Why Choose This Product?

${data.productName} stands out in${data.category ? ` the ${data.category} category` : ' its class'} with its combination of thoughtful design and practical functionality. Each aspect has been carefully considered to provide you with the best possible experience.

## Specifications

- Brand: ${data.brand || 'Premium Brand'}
- Category: ${data.category || 'General'}
- Quality Guaranteed: Yes
- Satisfaction Assured: 100%

Experience the difference with ${data.productName} — where quality meets affordability.`;

    const tags = [
      data.productName.toLowerCase().replace(/\s+/g, '-'),
      data.category?.toLowerCase().replace(/\s+/g, '-'),
      data.brand?.toLowerCase().replace(/\s+/g, '-'),
      'premium',
      'quality',
      'best-seller'
    ].filter(Boolean) as string[];

    const metaTitle = `${data.productName} - ${data.brand || 'Premium Product'}${data.category ? ` | ${data.category}` : ''}`.slice(0, 60);
    
    const metaDescription = `Buy ${data.productName}${data.brand ? ` by ${data.brand}` : ''} at the best price. High quality${data.category ? ` ${data.category.toLowerCase()}` : ''} product with fast shipping and satisfaction guarantee.`.slice(0, 160);

    const seoKeywords = [
      data.productName.toLowerCase(),
      data.category?.toLowerCase(),
      data.brand?.toLowerCase(),
      'buy online',
      'best price',
      'free shipping',
      'premium quality',
      'top rated'
    ].filter(Boolean).join(', ');

    return {
      shortDescription,
      description,
      tags: tags.join(', '),
      metaTitle,
      metaDescription,
      seoKeywords,
    };
  }

  private async callAI(prompt: string, systemPrompt?: string): Promise<string> {
    // Provider abstraction - in production, this would call the actual AI provider
    // For now, return a simulated response
    if (!this.apiKey) {
      return JSON.stringify({
        description: `This product features excellent quality and design. ${prompt.split('\n')[0]}`,
        shortDescription: 'A high-quality product with premium features.',
      });
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      const data: any = await response.json();
      return data.choices?.[0]?.message?.content || 'Unable to generate content';
    } catch (error) {
      return 'AI service temporarily unavailable';
    }
  }

  private async logUsage(storeId: string, data: {
    operation: string;
    inputTokens: number;
    outputTokens: number;
    prompt: string;
    response: string;
    duration: number;
  }) {
    try {
      await prisma.aiUsage.create({
        data: {
          storeId,
          provider: this.provider,
          model: this.model,
          operation: data.operation,
          inputTokens: Math.round(data.inputTokens),
          outputTokens: Math.round(data.outputTokens),
          prompt: data.prompt.substring(0, 2000),
          response: data.response.substring(0, 2000),
          duration: data.duration,
        },
      });
    } catch {
      // Don't throw on logging failure
    }
  }
}

export const aiService = new AiService();
