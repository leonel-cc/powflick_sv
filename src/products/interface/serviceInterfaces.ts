import { StateProduct } from '../entity/products.entity';

export interface PaginatedProductsResponse {
  page: number;
  prevPage: number | null;
  nextPage: number | null;
  totalPages: number | null;
  total: number | null;
  products: Product[];
  count: {
    total: number;
    sports: Record<string, number>;
    colors: Record<string, number>;
    categories: Record<string, number>;
    gender: Record<string, number>;
  };
}

export interface Product {
  id: string;
  title: string;
  content: string;
  short_description: string;
  date: string;
  price: number;
  regular_price?: number;
  discount?: number;
  stock_status: string;
  stock: number;
  product_categories: string;
  genders?: string;
  sports?: string;
  colors?: string[];
  images?: string[];
  status: StateProduct;
  URL: string;
  featured: boolean;
  sportId: string;
}

type CustomizationSides = {
  logoUrl: string;
  logoId: string;
  logoPosition: {
    x: number;
    y: number;
  };
  logoSize: number;
  text: string;
  font: string;
  textPosition: {
    x: number;
    y: number;
  };
  textSize: number;
  textColor: string;
  number: string;
  numberPosition: {
    x: number;
    y: number;
  };
  numberSize: number;
  numberColor: string;
};

export type CustomizationType = {
  id: string;
  price: number;
  size: string;
  frontSide: CustomizationSides;
  backSide: CustomizationSides;
  sleeve: string;
  neck: string;
  socks: string;
  pants: string;
  shorts: string;
  materials: string;
};
export interface Response {
  message?: string;
  status: number;
}