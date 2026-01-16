"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Building2,
  Eye,
  Trash2,
  Edit,
  Search,
  Home,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { getAllPropertiesAsync, deletePropertyAsync } from "@/lib/propertyStore";
import { Property } from "@/lib/mockData";
import { CityId } from "@/lib/egyptPlaces";

// Helper function to get property URL with new structure
function getPropertyUrl(property: Property): string {
  const citySlug = property.location.cityId || "new-damietta";
  const districtSlug = getDistrictSlug(property.location.district);
  return `/${citySlug}/${districtSlug}/${property.id}`;
}

function getDistrictSlug(districtName: string): string {
  // Handle empty or undefined district
  if (!districtName || districtName.trim() === "") {
    return "unknown-district";
  }

  const slugMap: Record<string, string> = {
    "الحي الأول": "first-district",
    "الحي الثاني": "second-district",
    "الحي الثالث": "third-district",
    "الحي الرابع": "fourth-district",
    "الحي الخامس": "fifth-district",
    "الحي السادس (المتميز)": "sixth-district",
    "مشروع جنة": "janna-project",
    "دار مصر - موقع 1": "dar-misr-1",
    "دار مصر - موقع 2": "dar-misr-2",
    "سكن مصر - جنوب الحي الأول": "sakan-misr-south",
    "سكن مصر - غرب الجامعات": "sakan-misr-west",
    "بيت الوطن - شرق": "beit-al-watan-east",
    "بيت الوطن - غرب": "beit-al-watan-west",
    "بيت الوطن - امتداد الشاطئ": "beit-al-watan-beach",
    "المنطقة المركزية (أ)": "central-area-a",
    "المنطقة المركزية (ب)": "central-area-b",
    "المنطقة المركزية (ج)": "central-area-c",
    "منطقة الشاليهات": "chalets",
    "R1": "r1", "R2": "r2", "R3": "r3", "R4": "r4", "R5": "r5", "R6": "r6", "R7": "r7",
    "الحي السكني الأول": "residential-1",
    "الحي السكني الثاني": "residential-2",
    "الحي السكني الثالث": "residential-3",
    "سكن لكل المصريين": "sakan-kol-misryeen",
    "سكن لكل المصريين 2": "sakan-kol-misryeen-2",
    "سكن لكل المصريين 3": "sakan-kol-misryeen-3",
    "دار مصر": "dar-misr",
    "جنة": "janna",
    "الإسكان المتوسط": "medium-housing",
    "الإسكان الاجتماعي": "social-housing",
    "حي الفيلات": "villas-district",
    "منطقة الفيلات D": "villas-d",
    "فيلات الجولف": "golf-villas",
    "فيلات البحيرات": "lake-villas",
    "داون تاون": "downtown",
    "المول التجاري المركزي": "central-mall",
    "منطقة الأعمال المركزية CBD": "cbd",
    "المحور التجاري": "commercial-axis",
    "منطقة الخدمات": "services-zone",
    "الحديقة المركزية": "central-park",
    "منطقة الكورنيش": "corniche",
    "النادي الاجتماعي": "social-club",
    "المنطقة السياحية": "touristic-zone",
    "الواجهة البحرية": "waterfront",
    "شاطئ المنصورة الجديدة": "beach",
    "منتجعات الساحل": "coastal-resorts",
  };
  return slugMap[districtName] || districtName.toLowerCase().replace(/\s+/g, "-").replace(/[()]/g, "");
}

export default function DashboardPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<CityId | "all">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const allProperties = await getAllPropertiesAsync();
      setProperties(allProperties);
    } catch (error) {
      console.error("Error loading properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا العقار؟")) {
      const result = await deletePropertyAsync(id);
      if (result.success) {
        alert("تم حذف العقار بنجاح");
        loadProperties();
      } else {
        alert(result.error || "حدث خطأ أثناء حذف العقار");
      }
    }
  };

  const filteredProperties = properties.filter(
    (p) => {
      // Filter by city - العقارات بدون cityId تعتبر من دمياط الجديدة
      if (selectedCity !== "all") {
        const propertyCityId = p.location.cityId || "new-damietta";
        if (propertyCityId !== selectedCity) return false;
      }
      // Filter by search query
      return p.title.includes(searchQuery) ||
        p.location.district.includes(searchQuery) ||
        p.type.includes(searchQuery) ||
        (p.location.city && p.location.city.includes(searchQuery));
    }
  );

  const stats = {
    total: properties.length,
    verified: properties.filter((p) => p.isVerified).length,
    totalValue: properties.reduce((sum, p) => sum + p.price, 0),
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} مليار`;
    }
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} مليون`;
    }
    return price.toLocaleString("ar-EG");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">لوحة التحكم</h1>
            <p className="text-gray-600 mt-1">إدارة العقارات والإعلانات</p>
          </div>
          <Button asChild className="bg-orange-500 hover:bg-orange-600 gap-2">
            <Link href="/dashboard/add">
              <Plus className="h-5 w-5" />
              إضافة عقار جديد
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Building2 className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">إجمالي العقارات</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <CheckCircle2 className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">العقارات الموثقة</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.verified}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-amber-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">إجمالي القيمة</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {formatPrice(stats.totalValue)} ج.م
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                العقارات ({filteredProperties.length})
              </CardTitle>
              <div className="flex flex-col md:flex-row gap-3">
                {/* City Filter */}
                <div className="flex gap-2">
                  <Button
                    variant={selectedCity === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCity("all")}
                    className={selectedCity === "all" ? "bg-gray-700" : ""}
                  >
                    الكل
                  </Button>
                  <Button
                    variant={selectedCity === "new-damietta" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCity("new-damietta")}
                    className={selectedCity === "new-damietta" ? "bg-orange-500 hover:bg-orange-600" : ""}
                  >
                    دمياط الجديدة
                  </Button>
                  <Button
                    variant={selectedCity === "new-mansoura" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCity("new-mansoura")}
                    className={selectedCity === "new-mansoura" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                  >
                    المنصورة الجديدة
                  </Button>
                </div>
                {/* Search */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="بحث في العقارات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-gray-500 text-sm">
                    <th className="text-right py-4 px-2">العقار</th>
                    <th className="text-right py-4 px-2">النوع</th>
                    <th className="text-right py-4 px-2">المدينة</th>
                    <th className="text-right py-4 px-2">المنطقة</th>
                    <th className="text-right py-4 px-2">السعر</th>
                    <th className="text-right py-4 px-2">الحالة</th>
                    <th className="text-center py-4 px-2">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.slice(0, 20).map((property) => (
                    <tr
                      key={property.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={property.images[0]}
                              alt={property.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 line-clamp-1 max-w-[200px]">
                              {property.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {property.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <Badge variant="outline">{property.type}</Badge>
                      </td>
                      <td className="py-4 px-2">
                        <Badge className={`${property.location.cityId === "new-damietta"
                            ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                            : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          }`}>
                          {property.location.city || "دمياط الجديدة"}
                        </Badge>
                      </td>
                      <td className="py-4 px-2 text-gray-600">
                        {property.location.district}
                      </td>
                      <td className="py-4 px-2 font-semibold text-orange-600">
                        {formatPrice(property.price)} ج.م
                      </td>
                      <td className="py-4 px-2">
                        <Badge className={`${property.status === "جاهز"
                            ? "bg-green-500 hover:bg-green-600"
                            : property.status === "تم البيع"
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-yellow-500 hover:bg-yellow-600"
                          }`}>
                          {property.status || "جاهز"}
                        </Badge>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            title="عرض"
                          >
                            <Link href={getPropertyUrl(property)}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            title="تعديل"
                          >
                            <Link href={`/dashboard/edit/${property.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="حذف"
                            onClick={() => handleDelete(property.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProperties.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  لا توجد عقارات مطابقة للبحث
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
