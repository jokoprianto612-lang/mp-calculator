/**
 * DeepL Translation Service
 */

import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { redis } from '../lib/redis';
import type { TranslationRequest, TranslationResponse, SupportedLanguage } from '@mp-calculator/shared';

interface DeepLResponse {
  translations: Array<{
    text: string;
    detected_source_language: string;
  }>;
}

export class TranslationService {
  private client: AxiosInstance;
  private cachePrefix = 'translation:';
  private cacheTTL = 24 * 60 * 60; // 24 hours

  constructor() {
    this.client = axios.create({
      baseURL: config.deepl.apiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (config.deepl.apiKey) {
      this.client.defaults.headers.common['Authorization'] = `DeepL-Auth-Key ${config.deepl.apiKey}`;
    }
  }

  /**
   * Translate text using DeepL API with Redis caching
   */
  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const texts = Array.isArray(request.text) ? request.text : [request.text];
    const sourceLang = request.sourceLang ?? 'id';
    const targetLang = request.targetLang;

    // Check cache first
    const cacheKey = this.getCacheKey(texts, sourceLang, targetLang);
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as TranslationResponse;
    }

    // If no API key, return mock/fallback translation
    if (!config.deepl.apiKey) {
      return this.mockTranslate(texts, sourceLang, targetLang);
    }

    try {
      const response = await this.client.post<DeepLResponse>('/translate', {
        text: texts,
        target_lang: targetLang.toUpperCase(),
        source_lang: sourceLang.toUpperCase() !== 'AUTO' ? sourceLang.toUpperCase() : undefined,
        preserve_formatting: request.preserveFormatting ?? false,
      });

      const result: TranslationResponse = {
        translations: response.data.translations.map(t => ({
          text: t.text,
          detectedSourceLanguage: t.detected_source_language.toLowerCase() as any,
        })),
      };

      // Cache the result
      await redis.setex(cacheKey, this.cacheTTL, JSON.stringify(result));

      return result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw new Error('DeepL API quota exceeded or invalid key');
        }
        if (error.response?.status === 456) {
          throw new Error('DeepL API quota exceeded');
        }
      }
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get supported languages from DeepL
   */
  async getSupportedLanguages(): Promise<SupportedLanguage[]> {
    if (!config.deepl.apiKey) {
      return this.getMockLanguages();
    }

    try {
      const response = await this.client.get('/languages', {
        params: { type: 'target' },
      });

      return response.data.map((lang: any) => ({
        code: lang.language.toLowerCase() as any,
        name: lang.name,
        nativeName: lang.name, // DeepL doesn't provide native name, fallback
      }));
    } catch {
      return this.getMockLanguages();
    }
  }

  /**
   * Generate cache key
   */
  private getCacheKey(texts: string[], sourceLang: string, targetLang: string): string {
    const textHash = Buffer.from(texts.join('|')).toString('base64').slice(0, 50);
    return `${this.cachePrefix}${sourceLang}:${targetLang}:${textHash}`;
  }

  /**
   * Mock translation for development (when no API key)
   */
  private mockTranslate(texts: string[], sourceLang: string, targetLang: string): TranslationResponse {
    const translations = texts.map(text => ({
      text: `[${targetLang.toUpperCase()}] ${text}`,
      detectedSourceLanguage: sourceLang as any,
    }));
    return { translations };
  }

  /**
   * Mock supported languages
   */
  private getMockLanguages(): SupportedLanguage[] {
    return [
      { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'zh', name: 'Chinese', nativeName: '中文' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語' },
      { code: 'ko', name: 'Korean', nativeName: '한국어' },
    ];
  }
}

export const translationService = new TranslationService();