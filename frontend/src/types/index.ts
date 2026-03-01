export interface Currency {
  label: string;
  symbol: string;
  __typename?: string;
}

export interface Price {
  amount: number;
  currency: Currency;
  __typename?: string;
}

export interface AttributeItem {
  id: string;
  displayValue: string;
  value: string;
  __typename?: string;
}

export interface AttributeSet {
  id: string;
  name: string;
  type: string;
  items: AttributeItem[];
  __typename?: string;
}

export interface Product {
  id: string;
  name: string;
  inStock: boolean;
  gallery: string[];
  description?: string;
  category: string;
  brand?: string;
  attributes?: AttributeSet[];
  prices?: Price[];
  __typename?: string;
}

export interface Category {
  name: string;
  __typename?: string;
}

export interface CartItem {
  product: Product;
  selectedAttributes: Record<string, string>;
  quantity: number;
}

export interface GraphQLError {
  message: string;
  extensions?: { debugMessage?: string };
}
