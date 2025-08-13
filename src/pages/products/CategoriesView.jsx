import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Card, CardContent,
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { ArrowRight, Search, Trash2, Plus, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { imageUrl, parseMultilingual } from '@/lib/utils';

export default function CategoriesView({ data, loading, page, perPage, totalPages, form, onSubmit, update, language }) {
  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex justify-between items-center gap-5">
        <h2 className="text-xl font-semibold">Категории товаров</h2>

        <div className="flex gap-3">
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative sm:w-[360px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Поиск категорий…" className="pl-9" {...form.register('q')} />
            </div>

            <Button type="submit" variant="outline">Поиск</Button>
          </form>
          <Link to="/app/products/add-category">
            <Button className="bg-[#2A2C38] hover:bg-[#2A2C38]/90">
              <Plus className="h-4 w-4 mr-2" />
              Добавить
            </Button>
          </Link>
        </div>
      </div>

      {/* Categories Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Изображение</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Дата создания</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Загрузка…</TableCell>
                  </TableRow>
                )}
                {!loading && (data?.data?.length ?? 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Нет данных</TableCell>
                  </TableRow>
                )}
                {!loading &&
                  data?.data?.map((category, i) => (
                    <TableRow key={category?.id}>
                      <TableCell>{(page - 1) * perPage + i + 1}</TableCell>
                      <TableCell className="font-medium"> <img
                        src={category?.image?.length > 0 ? imageUrl + category.image[0] : "https://placehold.co/600x400"}
                        alt={parseMultilingual(category?.name, language)}
                        className="h-12 w-12 object-cover rounded"
                        loading='eager'
                      /></TableCell>
                      <TableCell className="font-medium">{parseMultilingual(category?.name, language)}</TableCell>
                      <TableCell>{new Date(category?.created_at).toLocaleDateString('ru-RU')}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          <Button size="icon" variant="outline" asChild title="Просмотр товаров">
                            <Link to={`/app/products/${category?.id}`}>
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button size="icon" variant="outline" title="Удалить">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
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
              {Array.from({ length: totalPages })
                .slice(0, 7)
                ?.map((_, idx) => {
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
                  {[10, 20, 30, 50, 100]?.map((n) => (
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