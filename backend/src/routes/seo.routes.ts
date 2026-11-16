import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';

const scanUrlSchema = z.object({
  url: z.string().url('URL inválida. Inclua https://')
});

export async function seoRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  // Endpoint de Auditoria e Diagnóstico SEO 360° em Tempo Real
  app.post('/scan', async (request, reply) => {
    const parse = scanUrlSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: parse.error.errors[0].message });
    }

    const { url } = parse.data;
    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        signal: AbortSignal.timeout(12000)
      });

      const responseTimeMs = Date.now() - startTime;
      const contentType = response.headers.get('content-type') || '';
      const html = await response.text();

      // Extração de Elementos Principais via Regex Robusto
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : '';

      const getMetaContent = (nameOrProp: string) => {
        const regex = new RegExp(`<meta[^>]*(?:name|property)=["']${nameOrProp}["'][^>]*content=["']([^"']*)["']`, 'i');
        const match = html.match(regex);
        if (match) return match[1].trim();
        const altRegex = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${nameOrProp}["']`, 'i');
        const altMatch = html.match(altRegex);
        return altMatch ? altMatch[1].trim() : '';
      };

      const description = getMetaContent('description');
      const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
      const canonical = canonicalMatch ? canonicalMatch[1].trim() : '';

      const ogTitle = getMetaContent('og:title');
      const ogDesc = getMetaContent('og:description');
      const ogImage = getMetaContent('og:image');
      const robots = getMetaContent('robots');
      const viewport = getMetaContent('viewport');

      // Headings
      const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]*>/g, '').trim());
      const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
      const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;

      // Imagens e Alt tags
      const imgTags = html.match(/<img[^>]*>/gi) || [];
      const imagesTotal = imgTags.length;
      const imagesWithAlt = imgTags.filter(img => /alt=["'][^"']+["']/i.test(img)).length;
      const imagesMissingAlt = imagesTotal - imagesWithAlt;

      // JSON-LD Schemas
      const jsonLdScripts = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
      const schemasFound: any[] = [];
      for (const s of jsonLdScripts) {
        try {
          const parsed = JSON.parse(s[1].trim());
          if (Array.isArray(parsed)) {
            schemasFound.push(...parsed);
          } else if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
            schemasFound.push(...parsed['@graph']);
          } else {
            schemasFound.push(parsed);
          }
        } catch {}
      }

      const schemaTypes = schemasFound.map(s => s['@type']).filter(Boolean);

      // Verificação de Segurança e SSL
      const isHttps = url.startsWith('https://');

      // Cálculo de Pontuação SEO (0 a 100)
      let score = 100;
      const recommendations: string[] = [];

      if (!title) {
        score -= 20;
        recommendations.push('Tag <title> ausente! Adicione um título estratégico com até 60 caracteres.');
      } else if (title.length < 30 || title.length > 65) {
        score -= 8;
        recommendations.push(`Título tem ${title.length} caracteres. O ideal para o Google é entre 45 e 60 caracteres.`);
      }

      if (!description) {
        score -= 15;
        recommendations.push('Meta Description ausente! O Google utilizará trechos aleatórios da página na busca.');
      } else if (description.length < 90 || description.length > 165) {
        score -= 6;
        recommendations.push(`Meta Description tem ${description.length} caracteres. O recomendado é entre 120 e 160.`);
      }

      if (!canonical) {
        score -= 10;
        recommendations.push('Tag rel="canonical" ausente. Risco de divisão de autoridade e conteúdo duplicado.');
      }

      if (h1Matches.length === 0) {
        score -= 12;
        recommendations.push('Nenhum cabeçalho <h1> encontrado. O Google precisa de exatamente um <h1> principal.');
      } else if (h1Matches.length > 1) {
        score -= 5;
        recommendations.push(`Encontrados ${h1Matches.length} cabeçalhos <h1>. Recomenda-se manter apenas um <h1> principal.`);
      }

      if (schemaTypes.length === 0) {
        score -= 15;
        recommendations.push('Nenhum Schema Markup JSON-LD detectado. O site não concorre a Rich Snippets nem destaque em IA.');
      }

      if (imagesMissingAlt > 0) {
        score -= 8;
        recommendations.push(`${imagesMissingAlt} imagens sem atributo alt. Afeta acessibilidade e ranqueamento no Google Imagens.`);
      }

      if (!isHttps) {
        score -= 20;
        recommendations.push('URL não utiliza HTTPS. Navegadores e o Google penalizam conexões sem SSL.');
      }

      if (responseTimeMs > 1500) {
        score -= 10;
        recommendations.push(`Tempo de resposta de ${responseTimeMs}ms acima do ideal (<800ms). Impacta Core Web Vitals.`);
      }

      score = Math.max(10, Math.min(100, score));

      return reply.send({
        url,
        status: response.status,
        statusText: response.statusText,
        responseTimeMs,
        score,
        isHttps,
        meta: {
          title,
          titleLength: title.length,
          description,
          descriptionLength: description.length,
          canonical,
          robots: robots || 'index, follow',
          viewport: !!viewport
        },
        openGraph: {
          title: ogTitle || title,
          description: ogDesc || description,
          image: ogImage || null
        },
        headings: {
          h1: h1Matches,
          h2Count,
          h3Count
        },
        images: {
          total: imagesTotal,
          withAlt: imagesWithAlt,
          missingAlt: imagesMissingAlt
        },
        schemas: {
          count: schemaTypes.length,
          types: schemaTypes
        },
        recommendations,
        analyzedAt: new Date().toISOString()
      });

    } catch (err: any) {
      return reply.status(500).send({
        error: `Não foi possível auditar a URL ${url}: ${err.message || 'Falha de conexão'}`
      });
    }
  });

  // Templates Oficiais de Schema JSON-LD Prontos para os 3 Projetos
  app.get('/templates', async () => {
    return {
      guiaSobrevivencia: {
        site: 'Guia de Sobrevivência Civil',
        domain: 'prontoparaoimprevisto.com.br',
        schemas: [
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Guia de Sobrevivência Civil',
            url: 'https://prontoparaoimprevisto.com.br',
            description: 'Manual definitivo de preparação e sobrevivência civil para imprevistos e emergências.',
            inLanguage: 'pt-BR'
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'O que deve conter uma mochila de emergência (Bug-out Bag)?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Água potável (3L por pessoa), alimentos não perecíveis para 72 horas, kit de primeiros socorros, lanterna solar/dínamo, rádio AM/FM, apito, canivete multifunção e documentos importantes.'
                }
              },
              {
                '@type': 'Question',
                name: 'Como armazenar água potável por longos períodos?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Utilize recipientes de polietileno de alta densidade (PEAD) de grau alimentício, protegidos da luz solar, tratados com 2 a 4 gotas de hipoclorito de sódio por litro.'
                }
              }
            ]
          }
        ]
      },
      jtpcd: {
        site: 'Já Te Contaram PcD?',
        domain: 'jtpcd.vercel.app',
        schemas: [
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Já Te Contaram PcD?',
            url: 'https://jtpcd.vercel.app',
            description: 'Plataforma de direitos, isenções tributárias, benefícios e acessibilidade para Pessoas com Deficiência.',
            accessibilityHazard: 'none',
            accessibilityFeature: ['alternativeText', 'highContrastDisplay', 'screenReaderSupport']
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Quem tem direito à isenção de IPI e ICMS na compra de veículos PcD?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Pessoas com deficiência física, visual, mental severa ou profunda, ou com transtorno do espectro autista (TEA), diretamente ou por meio de seus representantes legais.'
                }
              }
            ]
          }
        ]
      },
      vocePodeTudo: {
        site: 'Você Pode Tudo',
        domain: 'vocepodetudo.com',
        schemas: [
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Você Pode Tudo',
            url: 'https://vocepodetudo.com',
            description: 'Hub de desenvolvimento pessoal, alta performance, mentalidade e produtividade prática.',
            inLanguage: 'pt-BR'
          }
        ]
      }
    };
  });
}
