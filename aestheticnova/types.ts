export type Product = {
  id: string;
  name: string;
  description: string;
  price_inr: number;
  category_id: string | null;
  sizes: string[];
  stock: number;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  image_url: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
  total: number;
  payment_status: string;
  shipping_status: string;
  created_at: string;
};

export type Setting = {
  key: string;
  value: string | null;
  image_url: string | null;
  updated_at: string;
};

export type HomepageContent = {
  key: string;
  value: string | null;
  image_url: string | null;
  updated_at: string;
};
