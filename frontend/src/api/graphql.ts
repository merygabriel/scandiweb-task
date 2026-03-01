import type { Product, Category } from '../types';

const API_URL = import.meta.env.VITE_GRAPHQL_URL || '/graphql';
const FETCH_TIMEOUT_MS = 10000;

interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{ message: string; extensions?: { debugMessage?: string } }>;
}

export async function graphql<T = unknown>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out. Is the PHP backend running? Run: php -S localhost:8084 -t public (from project root).');
    }
    throw new Error(err instanceof Error ? err.message : 'Network error');
  }
  clearTimeout(timeoutId);
  const text = await res.text();
  if (text.startsWith('<')) {
    throw new Error(
      'GraphQL server returned HTML. Is the PHP backend running? Run: php -S localhost:8084 -t public (from project root).'
    );
  }
  let json: GraphQLResponse<T>;
  try {
    json = JSON.parse(text) as GraphQLResponse<T>;
  } catch {
    const msg = !res.ok ? `Server error (${res.status}): ${text.slice(0, 150)}` : 'Invalid response: ' + text.slice(0, 100);
    throw new Error(msg);
  }
  if (json.errors?.length) {
    const err = json.errors[0];
    const message = err.extensions?.debugMessage || err.message || 'GraphQL Error';
    throw new Error(message);
  }
  if (!res.ok) {
    throw new Error((json as { message?: string }).message || `Server error (${res.status})`);
  }
  if (json.data === undefined) {
    throw new Error('No data in response');
  }
  return json.data;
}

export const GET_CATEGORIES = `
  query GetCategories {
    categories {
      name
      __typename
    }
  }
`;

export const GET_PRODUCTS = `
  query GetProducts($category: String) {
    products(category: $category) {
      id
      name
      inStock
      gallery
      category
      attributes {
        id
        name
        type
        items {
          id
          displayValue
          value
          __typename
        }
        __typename
      }
      prices {
        amount
        currency {
          label
          symbol
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;

export const GET_PRODUCT = `
  query GetProduct($id: String!) {
    product(id: $id) {
      id
      name
      inStock
      gallery
      description
      category
      brand
      attributes {
        id
        name
        type
        items {
          id
          displayValue
          value
          __typename
        }
        __typename
      }
      prices {
        amount
        currency {
          label
          symbol
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;

export const PLACE_ORDER = `
  mutation PlaceOrder($input: PlaceOrderInput!) {
    placeOrder(input: $input)
  }
`;

export type GetCategoriesData = { categories: Category[] };
export type GetProductsData = { products: Product[] };
export type GetProductData = { product: Product | null };
