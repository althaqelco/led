"use client";

import { useState, useEffect } from "react";
import { Property } from "@/lib/mockData";
import { getDistrictColor, CityId } from "@/lib/egyptPlaces";
import { isFavorite, toggleFavorite } from "@/lib/favoritesStore";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Phone,
  CheckCircle2,
  Building2,
  Eye,
  Heart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PropertyCardProps {
  property: Property;
  onFavoriteChange?: () => void;
}

// Helper function to get district slug
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

// Get property URL with new structure
function getPropertyUrl(property: Property): string {
  const citySlug = (property.location.cityId || "new-damietta") as CityId;
  const districtSlug = getDistrictSlug(property.location.district);
  return `/${citySlug}/${districtSlug}/${property.id}`;
}

export function PropertyCard({ property, onFavoriteChange }: PropertyCardProps) {
  const districtColor = getDistrictColor(property.location.district);
  const [isFav, setIsFav] = useState(false);
  const propertyUrl = getPropertyUrl(property);

  useEffect(() => {
    setIsFav(isFavorite(property.id));
  }, [property.id]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = toggleFavorite(property.id);
    setIsFav(newState);
    if (onFavoriteChange) {
      onFavoriteChange();
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} مليون`;
    }
    return price.toLocaleString("ar-EG");
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const propertyFullUrl = `${window.location.origin}${propertyUrl}`;
    const message = encodeURIComponent(
      `مرحباً، أنا مهتم بـ: ${property.title}\nالسعر: ${formatPrice(property.price)} جنيه\nالموقع: ${property.location.district}\nرابط العقار: ${propertyFullUrl}`
    );
    window.open(
      `https://wa.me/2${property.contact_whatsapp}?text=${message}`,
      "_blank"
    );
  };

  const handleCall = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `tel:${property.contact_whatsapp}`;
  };

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-white rounded-xl">
      {/* Image Container */}
      <Link href={propertyUrl} className="block">
        <div className="relative h-40 sm:h-48 overflow-hidden cursor-pointer">
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Category Badge - Sales Only */}
          <Badge className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-orange-500 hover:bg-orange-600 text-xs sm:text-sm">
            للبيع
          </Badge>

          {/* Status Badge */}
          <Badge className={`absolute top-8 right-2 sm:top-10 sm:right-3 text-xs sm:text-sm ${property.status === "جاهز"
              ? "bg-green-500 hover:bg-green-600"
              : property.status === "تم البيع"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-yellow-500 hover:bg-yellow-600"
            }`}>
            {property.status || "جاهز"}
          </Badge>

          {/* Sold Overlay */}
          {property.status === "تم البيع" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-lg transform -rotate-12 shadow-lg">
                تم البيع
              </div>
            </div>
          )}

          {/* Verified Badge */}
          {property.isVerified && (
            <Badge className="absolute top-2 left-10 sm:top-3 sm:left-12 bg-blue-500 hover:bg-blue-600 gap-1 text-xs sm:text-sm">
              <CheckCircle2 className="h-3 w-3" />
              موثق
            </Badge>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-2 left-2 sm:top-3 sm:left-3 p-1.5 rounded-full transition-all ${isFav
                ? "bg-red-500 text-white"
                : "bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white"
              }`}
          >
            <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
          </button>

          {/* Price Tag */}
          <div className="absolute bottom-0 right-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-3">
            <p className="text-white font-bold text-lg sm:text-xl">
              {formatPrice(property.price)}{" "}
              <span className="text-xs sm:text-sm font-normal">جنيه</span>
            </p>
            {/* Down Payment for Installments */}
            {property.payment?.type !== "كاش" && property.payment?.downPayment && (
              <div className="flex items-center gap-1 mt-1">
                <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                  تقسيط
                </span>
                <span className="text-orange-300 text-xs">
                  المقدم: {formatPrice(property.payment.downPayment)} ج
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>

      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        {/* Title - Clickable */}
        <Link href={propertyUrl} className="block hover:text-orange-500 transition-colors">
          <h3 className="font-semibold text-base sm:text-lg line-clamp-2 text-gray-800 leading-relaxed">
            {property.title}
          </h3>
        </Link>

        {/* Location Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* City Badge */}
          <Badge
            className={`${property.location.cityId === "new-mansoura"
                ? "bg-emerald-500 hover:bg-emerald-600"
                : "bg-orange-500 hover:bg-orange-600"
              } text-white border-0 text-xs`}
          >
            {property.location.city || "دمياط الجديدة"}
          </Badge>
          {/* District Badge */}
          <Badge
            className={`${districtColor} text-white hover:opacity-90 border-0`}
          >
            <MapPin className="h-3 w-3 ml-1" />
            {property.location.district}
          </Badge>
        </div>

        {/* Property Type */}
        <div className="flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm">
          <Building2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="truncate">{property.type}</span>
          <span className="text-gray-300">|</span>
          <span className="truncate">{property.details.finishing}</span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2 pt-2 border-t text-xs sm:text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Maximize className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>{property.details.area_sqm}م²</span>
          </div>
          {property.details.bedrooms > 0 && (
            <div className="flex items-center gap-1 text-gray-600">
              <Bed className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span>{property.details.bedrooms}</span>
            </div>
          )}
          {property.details.bathrooms > 0 && (
            <div className="flex items-center gap-1 text-gray-600">
              <Bath className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span>{property.details.bathrooms}</span>
            </div>
          )}
        </div>

        {/* Amenities - Hidden on small mobile */}
        <div className="hidden sm:flex flex-wrap gap-1">
          {property.amenities.slice(0, 3).map((amenity, index) => (
            <Badge key={index} variant="outline" className="text-xs border-gray-300 text-gray-600">
              {amenity}
            </Badge>
          ))}
          {property.amenities.length > 3 && (
            <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
              +{property.amenities.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-3 sm:p-4 pt-0 gap-2">
        <Button
          asChild
          variant="outline"
          className="flex-1 gap-1 sm:gap-2 text-xs sm:text-sm h-9 sm:h-10"
        >
          <Link href={propertyUrl}>
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            التفاصيل
          </Link>
        </Button>
        {property.status !== "تم البيع" && (
          <>
            <Button
              onClick={handleCall}
              variant="outline"
              className="h-9 sm:h-10 px-3 border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
            >
              <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </Button>
            <Button
              onClick={handleWhatsApp}
              variant="outline"
              className="h-9 sm:h-10 px-3 border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
