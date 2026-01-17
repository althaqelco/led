"use client";

import { useState } from "react";
import { CITIES, CITY_DATA, CityId } from "@/lib/egyptPlaces";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Building, MapPin, Building2 } from "lucide-react";

interface HeroSectionProps {
  onSearch: (filters: {
    city: CityId | "all";
    district: string;
    type: string;
  }) => void;
  totalProperties?: number;
  totalDistricts?: number;
}

const PROPERTY_TYPE_OPTIONS = [
  { value: "all", label: "جميع الأنواع" },
  { value: "شقة", label: "شقة" },
  { value: "شقة فاخرة", label: "شقة فاخرة" },
  { value: "فيلا منفصلة", label: "فيلا منفصلة" },
  { value: "دوبلكس", label: "دوبلكس" },
  { value: "بنتهاوس", label: "بنتهاوس" },
  { value: "محل تجاري", label: "محل تجاري" },
  { value: "مقر إداري", label: "مقر إداري" },
  { value: "عيادة", label: "عيادة" },
  { value: "أرض", label: "أرض" },
  { value: "شاليه", label: "شاليه" },
  { value: "روف", label: "روف" },
];

export function HeroSection({ onSearch, totalProperties = 100, totalDistricts = 40 }: HeroSectionProps) {
  const [selectedCity, setSelectedCity] = useState<CityId | "all">("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Get categories based on selected city
  const getCategories = () => {
    if (selectedCity === "all") {
      return [
        { city: CITIES["new-damietta"], categories: CITY_DATA["new-damietta"].categories },
        { city: CITIES["new-mansoura"], categories: CITY_DATA["new-mansoura"].categories },
      ];
    }
    return [{ city: CITIES[selectedCity], categories: CITY_DATA[selectedCity].categories }];
  };

  const handleSearch = () => {
    onSearch({
      city: selectedCity,
      district: selectedDistrict,
      type: selectedType,
    });
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value as CityId | "all");
    setSelectedDistrict("all"); // Reset district when city changes
  };

  return (
    <section className="relative min-h-[400px] md:min-h-[500px] bg-gradient-to-bl from-gray-900 via-gray-800 to-orange-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-6 md:mb-12">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-2 md:mb-4">
            التيسير <span className="text-orange-400">للعقارات</span>
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-gray-300 max-w-3xl mx-auto px-2">
            منصتك الأولى للبحث عن عقارات للبيع في{" "}
            <span className="text-orange-400 font-semibold">دمياط الجديدة</span>
            {" "}و{" "}
            <span className="text-emerald-400 font-semibold">المنصورة الجديدة</span>
          </p>

          {/* City Tags */}
          <div className="flex justify-center gap-3 mt-4">
            <span className="inline-flex items-center gap-2 bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 text-orange-300 px-4 py-2 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
              دمياط الجديدة
            </span>
            <span className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 text-emerald-300 px-4 py-2 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              المنصورة الجديدة
            </span>
          </div>
        </div>

        {/* Search Box */}
        <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* City Select */}
            <div className="space-y-1 md:space-y-2">
              <label className="text-white text-xs md:text-sm flex items-center gap-1 md:gap-2">
                <Building2 className="h-3 w-3 md:h-4 md:w-4" />
                المدينة
              </label>
              <Select
                value={selectedCity}
                onValueChange={handleCityChange}
                dir="rtl"
              >
                <SelectTrigger className="bg-white border-0 text-right">
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل المدن</SelectItem>
                  {Object.values(CITIES).map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Select */}
            <div className="space-y-1 md:space-y-2">
              <label className="text-white text-xs md:text-sm flex items-center gap-1 md:gap-2">
                <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                المنطقة
              </label>
              <Select
                value={selectedDistrict}
                onValueChange={setSelectedDistrict}
                dir="rtl"
              >
                <SelectTrigger className="bg-white border-0 text-right">
                  <SelectValue placeholder="اختر المنطقة" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  <SelectItem value="all">جميع المناطق</SelectItem>
                  {getCategories().map(({ city, categories }) => (
                    <SelectGroup key={city.id}>
                      <SelectLabel className={`font-bold ${city.id === "new-damietta" ? "text-orange-600" : "text-emerald-600"
                        }`}>
                        {city.nameAr}
                      </SelectLabel>
                      {categories.map((category) => (
                        category.districts.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Property Type Select */}
            <div className="space-y-1 md:space-y-2">
              <label className="text-white text-xs md:text-sm flex items-center gap-1 md:gap-2">
                <Building className="h-3 w-3 md:h-4 md:w-4" />
                نوع العقار
              </label>
              <Select
                value={selectedType}
                onValueChange={setSelectedType}
                dir="rtl"
              >
                <SelectTrigger className="bg-white border-0 text-right">
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <div className="space-y-1 md:space-y-2">
              <label className="text-transparent text-xs md:text-sm hidden md:block">بحث</label>
              <Button
                onClick={handleSearch}
                className="w-full bg-orange-500 hover:bg-orange-600 h-9 md:h-10 gap-1 md:gap-2 text-sm md:text-base"
              >
                <Search className="h-4 w-4" />
                بحث
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-4 sm:gap-6 md:gap-12 mt-6 md:mt-12 flex-wrap">
          <div className="text-center">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-400">
              2
            </p>
            <p className="text-gray-300 text-xs sm:text-sm md:text-base">مدينة</p>
          </div>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-400">
              {totalProperties}+
            </p>
            <p className="text-gray-300 text-xs sm:text-sm md:text-base">عقار متاح</p>
          </div>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-400">
              {totalDistricts}+
            </p>
            <p className="text-gray-300 text-xs sm:text-sm md:text-base">منطقة</p>
          </div>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-400">
              5+
            </p>
            <p className="text-gray-300 text-xs sm:text-sm md:text-base">سنوات خبرة</p>
          </div>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-400">
              100%
            </p>
            <p className="text-gray-300 text-xs sm:text-sm md:text-base">موثوق</p>
          </div>
        </div>
      </div>
    </section>
  );
}
