import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { getProducts } from '@/services/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { ArrowRight, FileText, Copy, Search, Trash2 } from 'lucide-react';

const schema = z.object({
  q: z.string().optional(),
  period: z.enum(['week', 'month', 'all']),
  perPage: z.coerce.number().int().min(5).max(100),
});

function useQS() {
  const [sp, setSp] = useSearchParams();
  const page = Math.max(1, Number(sp.get('page') || 1));
  const perPage = Math.min(100, Math.max(5, Number(sp.get('perPage') || 10)));
  const q = sp.get('q') || '';
  const period = sp.get('period') || 'week';

  const update = (patch) => {
    setSp(prev => {
      const ns = new URLSearchParams(prev);
      Object.entries(patch).forEach(([k, v]) => {
        if (v === null || v === '' || v === undefined) ns.delete(k);
        else ns.set(k, String(v));
      });
      return ns;
    }, { replace: true });
  };

  return { page, perPage, q, period, update };
}

function formatUZS(n) {
  return new Intl.NumberFormat('ru-RU').format(n) + ' сум';
}

export default function ProductsPage() {
  const { page, perPage, q, period, update } = useQS();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { q, period, perPage },
    values: { q, period, perPage },
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProducts({ page, perPage, q: q || undefined, period })
      .then(res => { if (!cancelled) setData(res); console.log(res) })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, perPage, q, period]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((data?.total || 0) / perPage)),
    [data?.total, perPage]
  );

  const onSubmit = (v) => {
    update({ q: v.q || '', period: v.period, perPage: v.perPage, page: 1 });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Товары</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#2A2C38] text-white border-none">
          <CardHeader className="pb-2">
            <CardTitle>Товары</CardTitle>
            <CardDescription className="text-white/70">Просмотр, добавление и удаление товаров</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle>Категории</CardTitle>
            <CardDescription>Категории товаров</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle>Гарантии</CardTitle>
            <CardDescription>Гарантии товаров</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle>Продано</CardTitle>
            <CardDescription>Проданные товары</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className='flex justify-between items-center gap-5'>
        <h2 className="text-xl font-semibold">Недавно проданные</h2>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative sm:w-[360px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Поиск…" className="pl-9" {...form.register('q')} />
          </div>

          <Select
            value={form.watch('period')}
            onValueChange={(v) => form.setValue('period', v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Период" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">За неделю</SelectItem>
              <SelectItem value="month">За месяц</SelectItem>
              <SelectItem value="all">За всё время</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit" variant="outline">Фильтр</Button>
        </form>

      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Тип товара</TableHead>
                  <TableHead>Склад</TableHead>
                  <TableHead>Количество</TableHead>
                  <TableHead>Дата добавления</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead className="w-28 text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">Загрузка…</TableCell>
                  </TableRow>
                )}
                {!loading && (data?.data?.length ?? 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Нет данных</TableCell>
                  </TableRow>
                )}
                {!loading && data?.data?.map((p, i) => (
                  <TableRow key={p?.id}>
                    <TableCell>{(page - 1) * perPage + i + 1}</TableCell>
                    <TableCell className="font-medium">{p?.name}</TableCell>
                    <TableCell>{p?.category_name}</TableCell>
                    <TableCell>{p?.warehouse}</TableCell>
                    <TableCell>{p?.qty}</TableCell>
                    <TableCell>{new Date(p?.created_at).toLocaleDateString('ru-RU')}</TableCell>
                    <TableCell>{formatUZS(p?.price)}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <Button size="icon" variant="outline" asChild title="Открыть">
                          <Link to={`/app/products/${p?.id}`}><ArrowRight className="h-4 w-4" /></Link>
                        </Button>
                        <Button size="icon" variant="outline" asChild title="Документ">
                          <div><Trash2 className="h-4 w-4" /></div>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => update({ page: page - 1 })}
            >
              ‹
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).slice(0, 7)?.map((_, idx) => {
                const p = idx + 1;
                const active = p === page;
                return (
                  <Button
                    key={p}
                    variant={active ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => update({ page: p })}
                  >
                    {p}
                  </Button>
                );
              })}
              {totalPages > 7 && <span className="px-2 text-muted-foreground">…</span>}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => update({ page: page + 1 })}
            >
              ›
            </Button>

            <div className="ml-auto flex items-center gap-2">
              <Select
                value={String(perPage)}
                onValueChange={(v) => update({ perPage: Number(v), page: 1 })}
              >
                <SelectTrigger className="w-[88px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 50, 100]?.map(n => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">/Страница</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}