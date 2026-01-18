'use client';

import { useEffect, useState } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { api, Product, Category, formatPrice } from '@/lib/api';
import RichTextEditor from '@/components/RichTextEditor';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState({ platform: '', category: '', search: '' });

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [page, filters]);

  const loadCategories = async () => {
    try {
      const cats = await api.getCategories();
      setCategories(cats);
    } catch (err: any) {
      console.error(err);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const result = await api.getProducts(10, page * 10, filters.platform, filters.category, filters.search);
      setProducts(result.data);
      setTotal(result.total);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      await loadProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading && (!products || products.length === 0)) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products Management</h1>
          <p className="text-sm text-slate-500">Manage products and applications</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filters.platform}
          onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Platforms</option>
          <option value="ios">iOS</option>
          <option value="android">Android</option>
          <option value="web">Web</option>
          <option value="windows">Windows</option>
          <option value="macos">macOS</option>
        </select>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {categories && categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products && products.map((product) => (
          <div key={product.id} className="rounded-lg bg-white p-5 shadow-sm">
            <div className="mb-4">
              {product.main_image_url ? (
                <img
                  src={product.main_image_url}
                  alt={product.name}
                  className="h-48 w-full rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-48 w-full items-center justify-center rounded-lg bg-slate-100">
                  <span className="text-slate-400">No Image</span>
                </div>
              )}
            </div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
              {product.platforms && product.platforms.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {product.platforms.map((platform) => (
                    <span key={platform.id} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 capitalize">
                      {platform.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="mb-3 line-clamp-2 text-sm text-slate-600">{product.description}</p>
            <div className="mb-3 flex flex-wrap gap-1">
              {product.categories && product.categories.map((cat) => (
                <span key={cat.id} className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                  {cat.name}
                </span>
              ))}
            </div>
            <div className="mb-4">
              <span className="text-lg font-bold text-indigo-600">{formatPrice(product.price)}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingProduct(product);
                  setShowModal(true);
                }}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <PencilIcon className="mr-1 inline h-4 w-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {(!products || products.length === 0) && !loading && (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <p className="text-slate-500">No products found</p>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-slate-700">
          Page {page + 1} of {Math.ceil(total / 10)}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={(page + 1) * 10 >= total}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {showModal && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
          onSave={loadProducts}
        />
      )}
    </div>
  );
}

function ProductModal({
  product,
  categories,
  onClose,
  onSave,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price || 0);
  const [platformIds, setPlatformIds] = useState<string[]>(() => {
    if (product?.platforms && product.platforms.length > 0) {
      return product.platforms.map(p => p.name);
    }
    return [];
  });
  const [categoryIds, setCategoryIds] = useState<string[]>(() => {
    if (product?.categories && product.categories.length > 0) {
      return product.categories.map(c => c.id);
    }
    return [];
  });
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Update all fields when product changes
  useEffect(() => {
    if (product) {
      console.log('Product loaded in modal:', product);
      console.log('Product categories:', product.categories);
      setName(product.name || '');
      setDescription(product.description || '');
      setPrice(product.price || 0);
      setIsActive(product.is_active ?? true);
      if (product.platforms && product.platforms.length > 0) {
        const platformNames = product.platforms.map(p => p.name);
        setPlatformIds(platformNames);
      } else {
        setPlatformIds([]);
      }
      if (product.categories && product.categories.length > 0) {
        const ids = product.categories.map(c => c.id);
        console.log('Setting categoryIds from product:', ids);
        setCategoryIds(ids);
      } else {
        console.log('No categories in product, setting empty array');
        setCategoryIds([]);
      }
    } else {
      // Reset for new product
      setName('');
      setDescription('');
      setPrice(0);
      setIsActive(true);
      setPlatformIds([]);
      setCategoryIds([]);
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price.toString());
      // Always send platform_ids, even if empty array
      const platformIdsJson = JSON.stringify(platformIds);
      formData.append('platform_ids', platformIdsJson);
      // Always send category_ids, even if empty array
      const categoryIdsJson = JSON.stringify(categoryIds);
      formData.append('category_ids', categoryIdsJson);
      console.log('=== FORM SUBMISSION ===');
      console.log('categoryIds state:', categoryIds);
      console.log('categoryIds JSON:', categoryIdsJson);
      console.log('FormData entries:');
      for (const [key, value] of formData.entries()) {
        console.log(key, ':', value);
      }
      formData.append('is_active', isActive.toString());
      if (mainImage) formData.append('main_image', mainImage);
      additionalImages.forEach((img) => {
        formData.append('additional_images', img);
      });
      if (file) formData.append('file', file);

      if (product) {
        await api.updateProduct(product.id, formData);
      } else {
        await api.createProduct(formData);
      }

      onSave();
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-6 text-xl font-bold text-slate-900">
          {product ? 'Edit' : 'Add'} Product
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Price</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <RichTextEditor
              content={description}
              onChange={setDescription}
              placeholder="Enter product description..."
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Platforms</label>
              <div className="mt-1 max-h-32 overflow-y-auto rounded-lg border border-slate-300 p-2">
                {['ios', 'android', 'web', 'windows', 'macos'].map((platformName) => (
                  <label key={platformName} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      checked={platformIds.includes(platformName)}
                      onChange={(e) => {
                        const newPlatformIds = e.target.checked
                          ? [...platformIds, platformName]
                          : platformIds.filter(id => id !== platformName);
                        setPlatformIds(newPlatformIds);
                      }}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-slate-700 capitalize">{platformName}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Categories</label>
              <div className="mt-1 max-h-32 overflow-y-auto rounded-lg border border-slate-300 p-2">
                {categories && categories.map((cat) => (
                  <label key={cat.id} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      checked={categoryIds.includes(cat.id)}
                      onChange={(e) => {
                        const newCategoryIds = e.target.checked
                          ? [...categoryIds, cat.id]
                          : categoryIds.filter(id => id !== cat.id);
                        console.log('Category checkbox changed:', cat.name, 'checked:', e.target.checked, 'new categoryIds:', newCategoryIds);
                        setCategoryIds(newCategoryIds);
                      }}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Main Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setMainImage(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Additional Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setAdditionalImages(files);
              }}
              className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <p className="mt-1 text-xs text-slate-500">You can select multiple images</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">File</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-slate-700">Active</span>
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
