const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'marketplace';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Platform {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_percentage?: number;
  platforms?: Platform[];
  categories?: Category[];
  main_image_url: string;
  additional_image_urls?: string[];
  file_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function formatPrice(price: number): string {
  return `Rp ${price.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export interface Order {
  id: string;
  user_id: string;
  user?: User;
  product_id: string;
  product?: Product;
  status: string;
  total: number;
  duitku_reference?: string;
  merchant_order_id?: string;
  license_id?: string;
  license_redeemed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  order?: Order;
  transfer_proof: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_URL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('admin_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async adminRegister(email: string, password: string, name: string) {
    return this.request<{ message: string; user: User }>('/admin/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async adminLogin(email: string, password: string) {
    const result = await this.request<{ token: string; user: User }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  // Users
  async getUsers(limit = 10, offset = 0) {
    return this.request<{ data: User[]; total: number }>(
      `/admin/users?limit=${limit}&offset=${offset}`
    );
  }

  async getUser(id: string) {
    return this.request<User>(`/admin/users/${id}`);
  }

  async updateUser(id: string, data: Partial<User>) {
    return this.request<User>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request<{ message: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories() {
    return this.request<Category[]>('/admin/categories');
  }

  async getCategory(id: string) {
    return this.request<Category>(`/admin/categories/${id}`);
  }

  async createCategory(name: string) {
    return this.request<Category>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async updateCategory(id: string, name: string) {
    return this.request<Category>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  async deleteCategory(id: string) {
    return this.request<{ message: string }>(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Products
  async getProducts(limit = 10, offset = 0, platform = '', category = '', search = '') {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (platform) params.append('platform', platform);
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    return this.request<{ data: Product[]; total: number }>(
      `/admin/products?${params.toString()}`
    );
  }

  async getProduct(id: string) {
    return this.request<Product>(`/admin/products/${id}`);
  }

  async createProduct(data: FormData) {
    const token = this.token;
    return fetch(`${this.baseUrl}/admin/products`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: data,
    }).then((res) => res.json());
  }

  async updateProduct(id: string, data: FormData) {
    const token = this.token;
    return fetch(`${this.baseUrl}/admin/products/${id}`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: data,
    }).then((res) => res.json());
  }

  async deleteProduct(id: string) {
    return this.request<{ message: string }>(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Payments
  async getPendingPayments(limit = 10, offset = 0) {
    return this.request<{ data: Payment[]; total: number }>(
      `/admin/payments/pending?limit=${limit}&offset=${offset}`
    );
  }

  async getPayment(id: string) {
    return this.request<Payment>(`/admin/payments/${id}`);
  }

  async approvePayment(id: string, status: 'approved' | 'rejected') {
    return this.request<Payment>(`/admin/payments/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Orders and Licenses
  async getAllOrders(limit = 10, offset = 0) {
    return this.request<{ data: Order[]; total: number }>(
      `/admin/orders?limit=${limit}&offset=${offset}`
    );
  }

  async getPaidOrders(limit = 10, offset = 0) {
    return this.request<{ data: Order[]; total: number }>(
      `/admin/orders/paid?limit=${limit}&offset=${offset}`
    );
  }

  async updateLicenseRedeemed(orderId: string, redeemed: boolean) {
    return this.request<Order>(`/admin/orders/${orderId}/license`, {
      method: 'PATCH',
      body: JSON.stringify({ redeemed }),
    });
  }

  async createLicense(productId: string, userId: string, total?: number) {
    const body: { product_id: string; user_id: string; total?: number } = {
      product_id: productId,
      user_id: userId,
    };
    if (total !== undefined && total !== null) body.total = total;
    return this.request<Order>('/admin/licenses', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}

export const api = new ApiClient();

