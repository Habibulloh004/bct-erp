// src/pages/products/ProductUpdate.jsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/services/api";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Upload, Globe, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { imageUrl } from "@/lib/utils";

// ------- helpers: triple "en***ru***uz"
const splitTriple = (s) => {
  const p = (s || "").split("***");
  return { en: p[0] || "", ru: p[1] || "", uz: p[2] || "" };
};
const joinTriple = (t) => [t?.en || "", t?.ru || "", t?.uz || ""].join("***");
const pickLang = (s, lang) => {
  const map = { en: 0, ru: 1, uz: 2 };
  const idx = map[lang] ?? 0;
  const parts = (s || "").split("***");
  return parts[idx] || parts[0] || "";
};

// Language configuration
const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸', shortLabel: 'EN' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺', shortLabel: 'RU' },
  { code: 'uz', label: 'O\'zbekcha', flag: '🇺🇿', shortLabel: 'UZ' }
];

// ------- zod schema (JS)
const FormSchema = z.object({
  name: z.object({
    en: z.string().min(1, "Название на английском обязательно"),
    ru: z.string().min(1, "Название на русском обязательно"),
    uz: z.string().min(1, "Название на узбекском обязательно")
  }),
  description: z.object({
    en: z.string().min(1, "Описание на английском обязательно"),
    ru: z.string().min(1, "Описание на русском обязательно"),
    uz: z.string().min(1, "Описание на узбекском обязательно")
  }),
  ads_title: z.object({
    en: z.string().min(1, "Заголовок рекламы на английском обязателен"),
    ru: z.string().min(1, "Заголовок рекламы на русском обязателен"),
    uz: z.string().min(1, "Заголовок рекламы на узбекском обязателен")
  }),
  guarantee: z.object({
    en: z.string().min(1, "Гарантия на английском обязательна"),
    ru: z.string().min(1, "Гарантия на русском обязательна"),
    uz: z.string().min(1, "Гарантия на узбекском обязательна")
  }),
  category_id: z.string().min(1, "Категория обязательна"),
  serial_number: z.string().optional(),
  price: z.string().optional(),
  discount: z.string().optional(),
});

export default function ProductUpdate() {
  const { productId } = useParams();
  const [lang, setLang] = React.useState("ru"); // По умолчанию русский
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [images, setImages] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const fileInputRef = React.useRef(null);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: { en: "", ru: "", uz: "" },
      description: { en: "", ru: "", uz: "" },
      ads_title: { en: "", ru: "", uz: "" },
      guarantee: { en: "", ru: "", uz: "" },
      category_id: "",
      serial_number: "",
      price: "",
      discount: "",
    },
  });

  // ---- load product + categories
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get(`/api/products/${productId}`),
          api.get(`/api/categories`),
        ]);

        const p = prodRes.data;
        const cats = catRes.data;
        console.log({ prodRes, cats, productId });

        if (!mounted) return;

        setCategories(cats?.data || []);
        setImages(Array.isArray(p.image) ? p.image : []);

        form.reset({
          name: splitTriple(p.name),
          description: splitTriple(p.description),
          ads_title: splitTriple(p.ads_title),
          guarantee: splitTriple(p.guarantee),
          category_id: p.category_id || "",
          serial_number: p.serial_number || "",
          price: p.price || "",
          discount: p.discount || "",
        });
      } catch (e) {
        console.error("Failed to load:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [productId]);

  const onSubmit = async (values) => {
    if (submitting) return;

    setSubmitting(true);
    try {
      const payload = {
        ...values,
        name: joinTriple(values.name),
        description: joinTriple(values.description),
        ads_title: joinTriple(values.ads_title),
        guarantee: joinTriple(values.guarantee),
        image: images,
      };
      console.log({ payload })
      await api.put(`/api/products/${productId}`, payload);

    } catch (error) {
      console.error("Ошибка при обновлении товара:", error);
      // Уведомление об ошибке
    } finally {
      setSubmitting(false);
    }
  };

  const triggerUpload = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleFiles = async (files) => {
    if (!files || !files.length || uploading) return;

    setUploading(true);
    const list = Array.from(files);

    try {
      const uploadPromises = list.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await api.post('/api/files/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          return response.data.url; // URL qaytaradi: /uploads/filename.jpg
        } catch (error) {
          console.error('Ошибка загрузки файла:', error);
          return null;
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url !== null);

      if (validUrls.length > 0) {
        setImages((prev) => [...prev, ...validUrls]);
        console.log("SUccess")
      } else {
        console.log("error")
      }
    } catch (error) {
      console.error('Ошибка при загрузке файлов:', error);
      alert('Ошибка при загрузке файлов');
    } finally {
      setUploading(false);
    }
  };
  const navigate = useNavigate();

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-56" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[800px] lg:col-span-2" />
          <Skeleton className="h-[520px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6">
      {/* Хлебные крошки */}
      <div className="mb-4 text-sm text-muted-foreground">
        Товары <span className="mx-2">/</span> Редактировать товар
      </div>

      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/products')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Редактировать товар</h1>
            <p className="text-muted-foreground mt-1">Обновить информацию о товаре на нескольких языках</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Globe className="w-3 h-3 mr-1" />
            Многоязычный
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ЛЕВАЯ ЧАСТЬ - Основная форма */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Информация о товаре
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>

                {/* Переключатель языков */}
                <Tabs value={lang} onValueChange={setLang} className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <TabsList className="grid w-full grid-cols-3 max-w-md">
                      {LANGUAGES.map((language) => (
                        <TabsTrigger
                          key={language.code}
                          value={language.code}
                          className="flex items-center gap-2"
                        >
                          <span>{language.flag}</span>
                          <span className="font-medium">{language.shortLabel}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <Badge variant="secondary" className="text-xs">
                      {LANGUAGES.find(l => l.code === lang)?.label}
                    </Badge>
                  </div>

                  {/* Контент для каждого языка */}
                  {LANGUAGES.map((language) => (
                    <TabsContent key={language.code} value={language.code} className="space-y-6 mt-0">

                      {/* Название товара */}
                      <FormField
                        control={form.control}
                        name={`name.${language.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Название товара
                              <span className="text-destructive">*</span>
                              <Badge variant="outline" className="text-xs">
                                {language.flag} {language.label}
                              </Badge>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={
                                  language.code === "en" ? "e.g. PM 68" :
                                    language.code === "ru" ? "Например: PM 68" :
                                      "Masalan: PM 68"
                                }
                                {...field}
                                disabled={submitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Заголовок рекламы */}
                      <FormField
                        control={form.control}
                        name={`ads_title.${language.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Заголовок рекламы
                              <span className="text-destructive">*</span>
                              <Badge variant="outline" className="text-xs">
                                {language.flag} {language.label}
                              </Badge>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                rows={2}
                                placeholder={
                                  language.code === "en" ? "Catchy headline for ads" :
                                    language.code === "ru" ? "Привлекательный заголовок для рекламы" :
                                      "Reklama uchun diqqatga sazovor sarlavha"
                                }
                                {...field}
                                disabled={submitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Описание */}
                      <FormField
                        control={form.control}
                        name={`description.${language.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Описание товара
                              <span className="text-destructive">*</span>
                              <Badge variant="outline" className="text-xs">
                                {language.flag} {language.label}
                              </Badge>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                rows={5}
                                placeholder={
                                  language.code === "en" ? "Detailed product description" :
                                    language.code === "ru" ? "Подробное описание товара" :
                                      "Mahsulotning batafsil tavsifi"
                                }
                                {...field}
                                disabled={submitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Гарантия */}
                      <FormField
                        control={form.control}
                        name={`guarantee.${language.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Информация о гарантии
                              <span className="text-destructive">*</span>
                              <Badge variant="outline" className="text-xs">
                                {language.flag} {language.label}
                              </Badge>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={
                                  language.code === "en" ? "e.g. 2 years warranty" :
                                    language.code === "ru" ? "Например: гарантия 2 года" :
                                      "Masalan: 2 yil kafolat"
                                }
                                {...field}
                                disabled={submitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                    </TabsContent>
                  ))}
                </Tabs>

                <Separator />

                {/* Категория + Серийный номер */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Категория
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select value={field.value} onValueChange={field.onChange} disabled={submitting}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите категорию" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {pickLang(c.name, lang)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serial_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Серийный номер</FormLabel>
                        <FormControl>
                          <Input placeholder="POS-X1-2024-001" {...field} disabled={submitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Цена и скидка */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Цена (сум)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1400000" {...field} disabled={submitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Скидка (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="10" min="0" max="100" {...field} disabled={submitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Кнопки действий */}
                <div className="flex items-center gap-3 justify-end pt-6 border-t">
                  <Button type="button" variant="outline" size="lg" disabled={submitting}>
                    Отмена
                  </Button>
                  <Button type="submit" size="lg" className="min-w-24" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Сохранение...
                      </>
                    ) : (
                      'Сохранить изменения'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* ПРАВАЯ ЧАСТЬ - Изображения и связанные товары */}
        <div className="space-y-6">
          {/* Изображения */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Фотографии товара
                <Badge variant="secondary" className="text-xs">
                  {images.length} фото
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {images?.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {images.map((src, i) => (
                    <div key={i} className="relative group border rounded-xl p-2 aspect-[3/4] overflow-hidden bg-muted/30 hover:bg-muted/50 transition-colors">
                      <img src={imageUrl + src} alt={`товар-${i}`} className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/80"
                        disabled={uploading || submitting}
                      >
                        ×
                      </button>
                      {i === 0 && (
                        <Badge className="absolute bottom-2 left-2 text-xs">Основное</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {images.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Изображения еще не загружены</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
                disabled={uploading || submitting}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={triggerUpload}
                disabled={uploading || submitting}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Добавить фото
                  </>
                )}
              </Button>

              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">Рекомендации по фото:</p>
                  <ul className="space-y-0.5 text-blue-600">
                    <li>• Используйте качественные изображения (мин. 800x600px)</li>
                    <li>• Первое изображение будет основным фото товара</li>
                    <li>• Поддерживаемые форматы: JPG, PNG, WebP</li>
                    <li>• Максимальный размер файла: 50MB</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}