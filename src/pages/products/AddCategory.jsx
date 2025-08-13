// src/pages/categories/AddCategory.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/services/api";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Upload, Globe, AlertCircle, Loader2, ArrowLeft, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const joinTriple = (t) => [t?.en || "", t?.ru || "", t?.uz || ""].join("***");

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
  top_category_id: z.string().optional(),
});

export default function AddCategory() {
  const navigate = useNavigate();
  const [lang, setLang] = React.useState("ru"); // По умолчанию русский
  const [uploading, setUploading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [image, setImage] = React.useState("");
  const fileInputRef = React.useRef(null);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: { en: "", ru: "", uz: "" },
      top_category_id: "",
    },
  });


  const onSubmit = async (values) => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      const payload = {
        name: joinTriple(values.name),
        top_category_id: values.top_category_id || null,
        image: image || "",
      };
      
      const response = await api.post('/api/categories', payload);
      console.log(response)
      
      // Успешное уведомление
      alert('Категория успешно создана!');
      
      // Перенаправление на страницу категорий
      navigate(`/categories`);
      
    } catch (error) {
      console.error("Ошибка при создании категории:", error);
      alert('Ошибка при создании категории');
    } finally {
      setSubmitting(false);
    }
  };

  const triggerUpload = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleFile = async (file) => {
    if (!file || uploading) return;
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setImage(response.data.url);
      alert('Изображение успешно загружено!');
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      alert('Ошибка при загрузке изображения');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImage("");
  };

  const handleCancel = () => {
    if (window.confirm('Вы уверены, что хотите отменить создание категории? Все несохраненные данные будут потеряны.')) {
      navigate('/categories');
    }
  };

  return (
    <div className="px-4 md:px-8 py-6">
      {/* Хлебные крошки */}
      <div className="mb-4 text-sm text-muted-foreground">
        Категории <span className="mx-2">/</span> Добавить категорию
      </div>

      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
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
            <h1 className="text-2xl md:text-3xl font-semibold">Добавить категорию</h1>
            <p className="text-muted-foreground mt-1">Создать новую категорию на нескольких языках</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Globe className="w-3 h-3 mr-1" />
            Многоязычная
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ЛЕВАЯ ЧАСТЬ - Основная форма */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Информация о категории
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
                      
                      {/* Название категории */}
                      <FormField
                        control={form.control}
                        name={`name.${language.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Название категории
                              <span className="text-destructive">*</span>
                              <Badge variant="outline" className="text-xs">
                                {language.flag} {language.label}
                              </Badge>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={
                                  language.code === "en" ? "e.g. Electronics" :
                                  language.code === "ru" ? "Например: Электроника" :
                                  "Masalan: Elektronika"
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

                {/* <Separator /> */}

                {/* <FormField
                  control={form.control}
                  name="top_category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Родительская категория (необязательно)</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={submitting}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите родительскую категорию" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Без родительской категории</SelectItem>
                          {topCategories?.map((tc) => (
                            <SelectItem key={tc.id} value={tc.id}>
                              {pickLang(tc.name, lang)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                {/* Кнопки действий */}
                <div className="flex items-center gap-3 justify-end pt-6 border-t">
                  <Button type="button" variant="outline" size="lg" onClick={handleCancel} disabled={submitting}>
                    Отмена
                  </Button>
                  <Button type="submit" size="lg" className="min-w-24" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Создание...
                      </>
                    ) : (
                      'Создать категорию'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* ПРАВАЯ ЧАСТЬ - Изображение и превью */}
        <div className="space-y-6">
          {/* Изображение категории */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Изображение категории
                <Badge variant="secondary" className="text-xs">
                  {image ? '1 фото' : 'Нет фото'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {image ? (
                <div className="relative group border rounded-xl p-4 aspect-[4/3] overflow-hidden bg-muted/30 hover:bg-muted/50 transition-colors">
                  <img src={image} alt="категория" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/80"
                    disabled={uploading || submitting}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-muted rounded-xl">
                  <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">Добавьте изображение категории</p>
                  <p className="text-xs mt-1">Рекомендуемый размер: 400x300px</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
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
                    {image ? 'Заменить изображение' : 'Добавить изображение'}
                  </>
                )}
              </Button>
              
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">Рекомендации по изображению:</p>
                  <ul className="space-y-0.5 text-blue-600">
                    <li>• Используйте качественные изображения (мин. 400x300px)</li>
                    <li>• Поддерживаемые форматы: JPG, PNG, WebP</li>
                    <li>• Максимальный размер файла: 50MB</li>
                    <li>• Изображение будет использоваться как иконка категории</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Статус создания */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Статус создания</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted/30">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Tag className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Новая категория</div>
                  <div className="text-xs text-muted-foreground">
                    {submitting ? 'Создается...' : 'Готова к созданию'}
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Заполните название на всех языках</p>
                <p>• Выберите родительскую категорию (опционально)</p>
                <p>• Добавьте изображение категории</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}