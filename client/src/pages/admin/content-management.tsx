import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Plus } from "lucide-react";

interface ContentSection {
  id: string;
  sectionKey: string;
  title?: string;
  subtitle?: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function ContentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const [formData, setFormData] = useState({
    sectionKey: "",
    title: "",
    subtitle: "",
    description: "",
    content: "",
    imageUrl: "",
    isActive: true,
  });

  const { data: sections, isLoading } = useQuery<ContentSection[]>({
    queryKey: ["content-sections"],
    queryFn: async () => {
      const response = await fetch("/api/content-sections");
      if (!response.ok) throw new Error("خطا در دریافت محتوا");
      return response.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const url = data.id 
        ? `/api/admin/content-sections/${data.id}`
        : "/api/admin/content-sections";
      const method = data.id ? "PUT" : "POST";
      
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-sections"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "موفق",
        description: "محتوا با موفقیت ذخیره شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "خطا در ذخیره محتوا",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/content-sections/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-sections"] });
      toast({
        title: "موفق",
        description: "محتوا با موفقیت حذف شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "خطا در حذف محتوا",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      sectionKey: "",
      title: "",
      subtitle: "",
      description: "",
      content: "",
      imageUrl: "",
      isActive: true,
    });
    setEditingSection(null);
  };

  const handleEdit = (section: ContentSection) => {
    setEditingSection(section);
    setFormData({
      sectionKey: section.sectionKey,
      title: section.title || "",
      subtitle: section.subtitle || "",
      description: section.description || "",
      content: section.content || "",
      imageUrl: section.imageUrl || "",
      isActive: section.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = editingSection 
      ? { ...formData, id: editingSection.id }
      : formData;
    saveMutation.mutate(data);
  };

  return (
    <DashboardLayout title="مدیریت محتوای سایت">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">مدیریت محتوای سایت</h1>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                افزودن بخش جدید
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSection ? "ویرایش بخش" : "افزودن بخش جدید"}
                </DialogTitle>
                <DialogDescription>
                  محتوای بخش‌های مختلف سایت را مدیریت کنید
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="sectionKey">کلید بخش *</Label>
                  <Input
                    id="sectionKey"
                    value={formData.sectionKey}
                    onChange={(e) => setFormData({ ...formData, sectionKey: e.target.value })}
                    placeholder="hero, features, pricing, etc."
                    required
                    disabled={!!editingSection}
                  />
                </div>
                <div>
                  <Label htmlFor="title">عنوان</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle">زیرعنوان</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">توضیحات</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="content">محتوای JSON (اختیاری)</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={5}
                    placeholder='{"key": "value"}'
                  />
                </div>
                <div>
                  <Label htmlFor="imageUrl">آدرس تصویر</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isActive">فعال</Label>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    انصراف
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? "در حال ذخیره..." : "ذخیره"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8">در حال بارگذاری...</div>
        ) : (
          <div className="grid gap-4">
            {sections?.length === 0 ? (
              <Card className="p-8 text-center text-gray-500">
                هیچ بخشی یافت نشد. بخش جدیدی اضافه کنید.
              </Card>
            ) : (
              sections?.map((section) => (
                <Card key={section.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{section.title || section.sectionKey}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${section.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {section.isActive ? 'فعال' : 'غیرفعال'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">کلید: {section.sectionKey}</p>
                      {section.subtitle && (
                        <p className="text-sm text-gray-600 mb-1">{section.subtitle}</p>
                      )}
                      {section.description && (
                        <p className="text-sm text-gray-500 mt-2">{section.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(section)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm("آیا از حذف این بخش اطمینان دارید؟")) {
                            deleteMutation.mutate(section.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
