import { useEffect, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductsView from './ProductsView';
import CategoriesView from './CategoriesView';
import { getCategories } from '@/services/categoreis';
import { getProducts } from '@/services/products';

const schema = z.object({
  q: z.string().optional(),
  period: z.enum(['week', 'month', 'all']).optional(),
  perPage: z.coerce.number().int().min(5).max(100),
});

function useQS() {
  const [sp, setSp] = useSearchParams();

  // Products query parameters
  const productsPage = Math.max(1, Number(sp.get('products_page') || 1));
  const productsPerPage = Math.min(100, Math.max(5, Number(sp.get('products_perPage') || 10)));
  const productsQ = sp.get('products_q') || '';
  const period = sp.get('period') || 'week'; // Shared, as it’s only used by ProductsView

  // Categories query parameters
  const categoriesPage = Math.max(1, Number(sp.get('categories_page') || 1));
  const categoriesPerPage = Math.min(100, Math.max(5, Number(sp.get('categories_perPage') || 10)));
  const categoriesQ = sp.get('categories_q') || '';

  const update = (prefix, patch) => {
    setSp((prev) => {
      const ns = new URLSearchParams(prev);
      Object.entries(patch).forEach(([k, v]) => {
        const key = `${prefix}_${k}`;
        if (v === null || v === '' || v === undefined) ns.delete(key);
        else ns.set(key, String(v));
      });
      return ns;
    }, { replace: true });
  };

  return {
    products: { page: productsPage, perPage: productsPerPage, q: productsQ, period, update: (patch) => update('products', patch) },
    categories: { page: categoriesPage, perPage: categoriesPerPage, q: categoriesQ, update: (patch) => update('categories', patch) },
  };
}

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState('products');
  const [language, setLanguage] = useState('ru'); // Default to Russian
  const { products, categories } = useQS();
  const [categoriesData, setCategoriesData] = useState(null);
  const [productsData, setProductsData] = useState(null);
  const [loading, setLoading] = useState(false);

  const productsForm = useForm({
    resolver: zodResolver(schema),
    defaultValues: { q: products.q, period: products.period, perPage: products.perPage },
    values: { q: products.q, period: products.period, perPage: products.perPage },
  });

  const categoriesForm = useForm({
    resolver: zodResolver(schema),
    defaultValues: { q: categories.q, perPage: categories.perPage },
    values: { q: categories.q, perPage: categories.perPage },
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      getCategories({ page: categories.page, perPage: categories.perPage, q: categories.q || undefined }),
      getProducts({ page: products.page, perPage: products.perPage, q: products.q || undefined, period: products.period }),
    ])
      .then(([categoriesRes, productsRes]) => {
        if (!cancelled) {
          setCategoriesData(categoriesRes);
          setProductsData(productsRes);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [products.page, products.perPage, products.q, products.period, categories.page, categories.perPage, categories.q]);

  const onProductsSubmit = (v) => {
    products.update({ q: v.q || '', period: v.period || 'week', perPage: v.perPage, page: 1 });
  };

  const onCategoriesSubmit = (v) => {
    categories.update({ q: v.q || '', perPage: v.perPage, page: 1 });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Товары</h1>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="ru">Русский</SelectItem>
            <SelectItem value="uz">O‘zbek</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className={`cursor-pointer transition-all duration-200 border-2 ${activeTab === 'products'
              ? 'bg-[#2A2C38] text-white border-[#2A2C38]'
              : 'bg-white hover:bg-gray-50 border-gray-200'
            }`}
          onClick={() => setActiveTab('products')}
        >
          <CardHeader className="pb-2">
            <CardTitle className={activeTab === 'products' ? 'text-white' : 'text-gray-900'}>
              Товары
            </CardTitle>
            <CardDescription className={activeTab === 'products' ? 'text-white/70' : 'text-gray-600'}>
              Просмотр, добавление и удаление товаров
            </CardDescription>
          </CardHeader>
        </Card>

        <Card
          className={`cursor-pointer transition-all duration-200 border-2 ${activeTab === 'categories'
              ? 'bg-[#2A2C38] text-white border-[#2A2C38]'
              : 'bg-white hover:bg-gray-50 border-gray-200'
            }`}
          onClick={() => setActiveTab('categories')}
        >
          <CardHeader className="pb-2">
            <CardTitle className={activeTab === 'categories' ? 'text-white' : 'text-gray-900'}>
              Категории
            </CardTitle>
            <CardDescription className={activeTab === 'categories' ? 'text-white/70' : 'text-gray-600'}>
              Категории товаров
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Active View */}
      {activeTab === 'products' && (
        <ProductsView
          data={productsData}
          loading={loading}
          page={products.page}
          perPage={products.perPage}
          totalPages={Math.max(1, Math.ceil((productsData?.total || 0) / products.perPage))}
          form={productsForm}
          onSubmit={onProductsSubmit}
          update={products.update}
          language={language}
        />
      )}
      {activeTab === 'categories' && (
        <CategoriesView
          data={categoriesData}
          loading={loading}
          page={categories.page}
          perPage={categories.perPage}
          totalPages={Math.max(1, Math.ceil((categoriesData?.total || 0) / categories.perPage))}
          form={categoriesForm}
          onSubmit={onCategoriesSubmit}
          update={categories.update}
          language={language}
        />
      )}
    </div>
  );
}