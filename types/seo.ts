// SEO & Content Management
export interface SEOTemplate {
  id: string;
  pageType: string;
  template: string;

  titleTemplate?: string;
  descriptionTemplate?: string;
  keywordsTemplate?: string;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

// Multi-language Support
export interface Translation {
  id: string;
  entityType: string;
  entityId: string;
  fieldName: string;
  languageCode: string;
  value: string;

  createdAt: Date;
  updatedAt: Date;
}

// Form Data Types
export interface SEOTemplateFormData {
  pageType: string;
  template: string;
  titleTemplate?: string;
  descriptionTemplate?: string;
  keywordsTemplate?: string;
}

export interface TranslationFormData {
  entityType: string;
  entityId: string;
  fieldName: string;
  languageCode: string;
  value: string;
}

// Supported Languages
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isRTL: boolean;
  isActive: boolean;
}

// SEO Meta Data
export interface SEOMetaData {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

// Content Localization
export interface LocalizedContent {
  [languageCode: string]: {
    title: string;
    description?: string;
    content: string;
    seoMeta: SEOMetaData;
  };
}
