"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Save,
  MapPin,
  Home,
  DollarSign,
  Image as ImageIcon,
  Phone,
  CheckCircle2,
  Plus,
  X,
  Upload,
  Loader2,
} from "lucide-react";
import { CITIES, CITY_DATA, CityId, FINISHING_TYPES, FLOOR_LEVELS, AMENITIES } from "@/lib/egyptPlaces";
import { addPropertyAsync } from "@/lib/propertyStore";
import { Property } from "@/lib/mockData";
import { enhanceTitle, enhanceDescription } from "@/lib/seoOptimizer";
import { uploadImage, validateImageFile, compressImage } from "@/lib/imageUpload";

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

const PROPERTY_TYPES = [
  "شقة",
  "شقة فاخرة",
  "فيلا منفصلة",
  "دوبلكس",
  "بنتهاوس",
  "تاون هاوس",
  "محل تجاري",
  "مقر إداري",
  "عيادة",
  "أرض",
  "مبنى تحت الإنشاء",
  "شاليه",
  "روف",
];

export default function AddPropertyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    type: "",
    city: "new-damietta" as CityId,
    district: "",
    address: "",
    area_sqm: "",
    bedrooms: "0",
    bathrooms: "0",
    level: "",
    finishing: "",
    contact_whatsapp: "",
    isVerified: false,
    paymentType: "كاش" as "كاش" | "تقسيط" | "كاش أو تقسيط",
    downPayment: "",
    monthlyInstallment: "",
    installmentYears: "",
    status: "جاهز" as "جاهز" | "تحت الإنشاء",
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const addImageUrl = () => {
    if (newImageUrl.trim() && !imageUrls.includes(newImageUrl)) {
      setImageUrls((prev) => [...prev, newImageUrl]);
      setNewImageUrl("");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress("جاري رفع الصور...");

    try {
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`جاري رفع الصورة ${i + 1} من ${files.length}...`);
        
        // Validate file
        const validation = validateImageFile(file);
        if (!validation.valid) {
          alert(validation.error);
          continue;
        }
        
        // Compress image
        const compressedFile = await compressImage(file);
        
        // Upload to Firebase
        const url = await uploadImage(compressedFile);
        uploadedUrls.push(url);
      }
      
      if (uploadedUrls.length > 0) {
        setImageUrls((prev) => [...prev, ...uploadedUrls]);
        setUploadProgress(`تم رفع ${uploadedUrls.length} صورة بنجاح!`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadProgress("فشل في رفع الصور. حاول مرة أخرى.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(""), 3000);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImageUrl = (url: string) => {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate district is selected
    if (!formData.district || formData.district.trim() === "") {
      alert("يرجى اختيار المنطقة");
      return;
    }
    
    setIsSubmitting(true);

    try {
      // SEO optimization for title and description
      const seoInput = {
        type: formData.type,
        district: formData.district,
        area_sqm: Number(formData.area_sqm),
        price: Number(formData.price),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        level: formData.level,
        finishing: formData.finishing,
        amenities: selectedAmenities,
        status: formData.status,
        paymentType: formData.paymentType,
      };
      
      const optimizedTitle = enhanceTitle(formData.title, seoInput);
      const optimizedDescription = enhanceDescription(formData.description || "", seoInput);
      
      const result = await addPropertyAsync({
        title: optimizedTitle,
        description: optimizedDescription,
        price: Number(formData.price),
        currency: "EGP",
        category: "بيع",
        type: formData.type,
        location: {
          city: CITIES[formData.city].nameAr as "دمياط الجديدة" | "المنصورة الجديدة",
          cityId: formData.city,
          district: formData.district,
          address: formData.address,
        },
        details: {
          area_sqm: Number(formData.area_sqm),
          bedrooms: Number(formData.bedrooms),
          bathrooms: Number(formData.bathrooms),
          level: formData.level,
          finishing: formData.finishing,
        },
        payment: {
          type: formData.paymentType,
          downPayment: formData.downPayment ? Number(formData.downPayment) : undefined,
          monthlyInstallment: formData.monthlyInstallment ? Number(formData.monthlyInstallment) : undefined,
          installmentYears: formData.installmentYears ? Number(formData.installmentYears) : undefined,
        },
        status: formData.status,
        amenities: selectedAmenities,
        images: imageUrls.length > 0 ? imageUrls : [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        ],
        contact_whatsapp: formData.contact_whatsapp,
        isVerified: formData.isVerified,
      });

      if (result.success && result.property) {
        alert("تم إضافة العقار بنجاح!");
        router.push(getPropertyUrl(result.property));
      } else {
        alert(result.error || "حدث خطأ أثناء إضافة العقار");
      }
    } catch (error) {
      console.error("Error adding property:", error);
      alert("حدث خطأ أثناء إضافة العقار");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard">
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">إضافة عقار جديد</h1>
            <p className="text-gray-600 mt-1">أضف تفاصيل العقار الجديد</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-orange-500" />
                    المعلومات الأساسية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عنوان العقار *
                    </label>
                    <Input
                      required
                      placeholder="مثال: شقة 120 متر بالحي الأول"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      وصف العقار
                    </label>
                    <textarea
                      placeholder="أدخل وصف تفصيلي للعقار..."
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نوع العقار *
                      </label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => handleChange("type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر النوع" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROPERTY_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        السعر (جنيه) *
                      </label>
                      <Input
                        required
                        type="number"
                        placeholder="0"
                        value={formData.price}
                        onChange={(e) => handleChange("price", e.target.value)}
                        dir="ltr"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-orange-500" />
                    الموقع
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* City Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المدينة *
                    </label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => {
                        handleChange("city", value);
                        handleChange("district", ""); // Reset district when city changes
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المدينة" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(CITIES).map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.nameAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* District Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المنطقة *
                    </label>
                    <Select
                      value={formData.district}
                      onValueChange={(value) => handleChange("district", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المنطقة" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {CITY_DATA[formData.city].categories.map((category) => (
                          <SelectGroup key={category.id}>
                            <SelectLabel className={`font-bold ${
                              formData.city === "new-damietta" ? "text-orange-600" : "text-emerald-600"
                            }`}>
                              {category.nameAr}
                            </SelectLabel>
                            {category.districts.map((district) => (
                              <SelectItem key={district} value={district}>
                                {district}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العنوان التفصيلي
                    </label>
                    <Input
                      placeholder="مثال: 15 شارع الجمهورية"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-orange-500" />
                    التفاصيل والمواصفات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        المساحة (م²) *
                      </label>
                      <Input
                        required
                        type="number"
                        placeholder="0"
                        value={formData.area_sqm}
                        onChange={(e) => handleChange("area_sqm", e.target.value)}
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        غرف النوم
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.bedrooms}
                        onChange={(e) => handleChange("bedrooms", e.target.value)}
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الحمامات
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.bathrooms}
                        onChange={(e) => handleChange("bathrooms", e.target.value)}
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الدور
                      </label>
                      <Select
                        value={formData.level}
                        onValueChange={(value) => handleChange("level", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر" />
                        </SelectTrigger>
                        <SelectContent>
                          {FLOOR_LEVELS.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      التشطيب
                    </label>
                    <Select
                      value={formData.finishing}
                      onValueChange={(value) => handleChange("finishing", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع التشطيب" />
                      </SelectTrigger>
                      <SelectContent>
                        {FINISHING_TYPES.map((finish) => (
                          <SelectItem key={finish} value={finish}>
                            {finish}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      المميزات والخدمات
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AMENITIES.map((amenity) => (
                        <Badge
                          key={amenity}
                          variant={
                            selectedAmenities.includes(amenity)
                              ? "default"
                              : "outline"
                          }
                          className={`cursor-pointer transition-colors ${
                            selectedAmenities.includes(amenity)
                              ? "bg-orange-500 hover:bg-orange-600"
                              : "hover:bg-gray-100"
                          }`}
                          onClick={() => toggleAmenity(amenity)}
                        >
                          {selectedAmenities.includes(amenity) && (
                            <CheckCircle2 className="h-3 w-3 me-1" />
                          )}
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    خيارات الدفع والتقسيط
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        حالة العقار *
                      </label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleChange("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر حالة العقار" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="جاهز">جاهز للتسليم</SelectItem>
                          <SelectItem value="تحت الإنشاء">تحت الإنشاء</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        طريقة الدفع *
                      </label>
                      <Select
                        value={formData.paymentType}
                        onValueChange={(value) => handleChange("paymentType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر طريقة الدفع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="كاش">كاش (نقدي)</SelectItem>
                          <SelectItem value="تقسيط">تقسيط فقط</SelectItem>
                          <SelectItem value="كاش أو تقسيط">كاش أو تقسيط</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.paymentType !== "كاش" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-orange-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          المقدم (جنيه)
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={formData.downPayment}
                          onChange={(e) => handleChange("downPayment", e.target.value)}
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          القسط الشهري (جنيه)
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={formData.monthlyInstallment}
                          onChange={(e) => handleChange("monthlyInstallment", e.target.value)}
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          مدة التقسيط (سنوات)
                        </label>
                        <Select
                          value={formData.installmentYears}
                          onValueChange={(value) => handleChange("installmentYears", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">سنة واحدة</SelectItem>
                            <SelectItem value="2">سنتان</SelectItem>
                            <SelectItem value="3">3 سنوات</SelectItem>
                            <SelectItem value="5">5 سنوات</SelectItem>
                            <SelectItem value="7">7 سنوات</SelectItem>
                            <SelectItem value="10">10 سنوات</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-orange-500" />
                    الصور
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* File Upload Section */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
                          <span className="text-orange-600 font-medium">{uploadProgress}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-10 w-10 text-gray-400" />
                          <span className="text-gray-600 font-medium">اضغط لرفع الصور</span>
                          <span className="text-sm text-gray-400">JPG, PNG, WebP - حد أقصى 5MB للصورة</span>
                        </>
                      )}
                    </label>
                  </div>

                  {uploadProgress && !isUploading && (
                    <p className="text-sm text-green-600 text-center">{uploadProgress}</p>
                  )}

                  <Separator />

                  {/* URL Input (Alternative) */}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">أو أضف رابط صورة:</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="أدخل رابط الصورة (URL)"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        dir="ltr"
                      />
                      <Button type="button" onClick={addImageUrl} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Image Preview Grid */}
                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 relative">
                            <Image
                              src={url}
                              alt={`صورة ${index + 1}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImageUrl(url)}
                            className="absolute top-2 left-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {index === 0 && (
                            <span className="absolute bottom-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                              رئيسية
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-gray-500">
                    الصورة الأولى ستكون الصورة الرئيسية للعقار
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-orange-500" />
                    معلومات التواصل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الواتساب *
                    </label>
                    <Input
                      required
                      placeholder="01001234567"
                      value={formData.contact_whatsapp}
                      onChange={(e) =>
                        handleChange("contact_whatsapp", e.target.value)
                      }
                      dir="ltr"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="isVerified"
                      checked={formData.isVerified}
                      onChange={(e) =>
                        handleChange("isVerified", e.target.checked)
                      }
                      className="w-5 h-5 text-orange-500 rounded"
                    />
                    <label htmlFor="isVerified" className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-500" />
                      <span>عقار موثق</span>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <Card>
                <CardContent className="p-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-lg gap-2"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        حفظ العقار
                      </>
                    )}
                  </Button>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    سيتم نشر العقار مباشرة بعد الحفظ
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
