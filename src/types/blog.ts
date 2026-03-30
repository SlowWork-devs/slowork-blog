export interface BlogCategory {
  id: number;
  name_es: string;
  name_en: string;
  creation_date: string;
}

export interface BlogPost {
  id: number;
  title_es: string;
  title_en: string;
  content_es: string;
  content_en: string;
  image_url: string;
  slug?: string;
  category_id: number;
  category?: BlogCategory;
  creation_date: string;
}

export interface BlogResponse {
  items: BlogPost[];
  pageInfo: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    paginationSize: number;
  };
}
