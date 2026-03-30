import type { BlogPost, BlogResponse } from '@/types/blog';

export type ApiLang = 'es' | 'en';

export type LocalizedBlogPost = Omit<BlogPost, 'title_es' | 'title_en' | 'content_es' | 'content_en'> & {
  title: string;
  content: string;
};

const localizeBlogPost = (post: BlogPost, lang: ApiLang): LocalizedBlogPost => ({
  ...post,
  slug: post.slug || String(post.id),
  category_id: post.category_id ?? 0,
  title: lang === 'es' ? post.title_es : post.title_en,
  content: lang === 'es' ? post.content_es : post.content_en,
});

const fetchGraphQL = async <T>(query: string, variables = {}): Promise<T> => {
  const baseUrl = import.meta.env.SLOWORK_API_URL as string | undefined;
  if (!baseUrl) throw new Error('SLOWORK_API_URL is not configured');

  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  const { data, errors } = (await res.json()) as {
    data?: T;
    errors?: Array<{ message?: string }>;
  };

  if (errors) {
    console.error('[GraphQL Error]:', errors);
    throw new Error(errors[0]?.message || 'Error en la consulta GraphQL');
  }

  if (!data) {
    throw new Error('Respuesta GraphQL sin datos');
  }

  return data;
};

const GET_BLOGS_QUERY = `
  query GetBlogs($currentPage: Int, $paginationSize: Int) {
    getBlogs(currentPage: $currentPage, paginationSize: $paginationSize) {
      items {
        id
        title_es
        title_en
        content_es
        content_en
        image_url
        category_id
        creation_date
        category {
          id
          name_es
          name_en
          creation_date
        }
      }
      pageInfo {
        totalItems
        totalPages
        currentPage
        paginationSize
      }
    }
  }
`;

const GET_BLOG_BY_ID_QUERY = `
  query GetBlog($id: Int!) {
    getBlog(id: $id) {
      id
      title_es
      title_en
      content_es
      content_en
      image_url
      category_id
      creation_date
      category {
        id
        name_es
        name_en
        creation_date
      }
    }
  }
`;

export async function getBlogs(params: { page: number; limit: number; lang?: ApiLang }) {
  const data = await fetchGraphQL<{ getBlogs: BlogResponse }>(GET_BLOGS_QUERY, {
    currentPage: params.page,
    paginationSize: params.limit,
  });

  const lang = params.lang === 'es' ? 'es' : 'en';
  return {
    pageInfo: data.getBlogs.pageInfo,
    items: data.getBlogs.items.map((post) => localizeBlogPost(post, lang)),
  };
}

export async function getBlogById(params: { id: number; lang?: ApiLang }) {
  const data = await fetchGraphQL<{ getBlog: BlogPost }>(GET_BLOG_BY_ID_QUERY, {
    id: params.id,
  });

  const lang = params.lang === 'es' ? 'es' : 'en';
  return localizeBlogPost(data.getBlog, lang);
}

