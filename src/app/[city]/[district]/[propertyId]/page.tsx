"use client";

import { useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumb, getPropertyBreadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Phone,
  CheckCircle2,
  Calendar,
  Building2,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Heart,
  Share2,
  Loader2,
} from "lucide-react";
import { getPropertyByIdAsync, getRelatedPropertiesAsync } from "@/lib/propertyStore";
import { CITIES, CityId } from "@/lib/egyptPlaces";
import { Property } from "@/lib/mockData";
import { PropertyCard } from "@/components/PropertyCard";

const VALID_CITIES = ["new-damietta", "new-mansoura"];

export default function PropertyDetailPage() {
  const params = useParams();
  const citySlug = params.city as string;
  const districtSlug = params.district as string;
  const propertyId = params.propertyId as string;

  // Validate city
  if (!VALID_CITIES.includes(citySlug)) {
    notFound();
  }

  const cityId = citySlug as CityId;
  const city = CITIES[cityId];
  const isNM = citySlug === "new-mansoura";

  const [property, setProperty] = useState<Property | null>(null);
  const [relatedProperties, setRelatedProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Load property and related properties
  useEffect(() => {
    const loadProperty = async () => {
      setIsLoading(true);
      try {
        const prop = await getPropertyByIdAsync(propertyId);
        setProperty(prop);

        // Load related properties with 90% similarity
        if (prop) {
          const related = await getRelatedPropertiesAsync(prop, 4);
          setRelatedProperties(related);
        }
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    };

    loadProperty();
  }, [propertyId]);

  // Check favorite status
  useEffect(() => {
    if (typeof window !== "undefined" && property) {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      setIsFavorite(favorites.includes(property.id));
    }
  }, [property]);

  const toggleFavorite = () => {
    if (!property) return;
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (isFavorite) {
      const newFavs = favorites.filter((id: string) => id !== property.id);
      localStorage.setItem("favorites", JSON.stringify(newFavs));
    } else {
      favorites.push(property.id);
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    if (navigator.share && property) {
      navigator.share({
        title: property.title,
        text: `${property.type} للبيع في ${property.location.district}`,
        url: window.location.href,
      });
    }
  };

  const handleWhatsApp = () => {
    if (!property) return;
    const message = encodeURIComponent(
      `مرحباً، أريد الاستفسار عن هذا العقار:\n${property.title}\n${property.type} في ${property.location.district}\nالسعر: ${formatPrice(property.price)}\nالرابط: ${window.location.href}`
    );
    window.open(`https://wa.me/${property.contact_whatsapp}?text=${message}`, "_blank");
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} مليون جنيه`;
    }
    return `${price.toLocaleString("ar-EG")} جنيه`;
  };

  // Dynamic SEO
  useEffect(() => {
    if (property) {
      document.title = `${property.title} | ${property.type} للبيع في ${property.location.district} - التيسير للعقارات`;
    }
  }, [property]);

  const themeColor = isNM ? "emerald" : "orange";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">العقار غير موجود</h1>
          <p className="text-gray-600 mb-4">عذراً، لم نتمكن من العثور على هذا العقار</p>
          <Button asChild className={`bg-${themeColor}-500`}>
            <Link href={`/${citySlug}`}>تصفح عقارات {city?.nameAr}</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <Breadcrumb
        items={getPropertyBreadcrumb(
          property.title,
          property.location.district,
          property.location.city || city?.nameAr,
          districtSlug
        )}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery - Property Finder Style */}
            <Card className="overflow-hidden shadow-lg">
              <div className="relative aspect-[16/10] bg-gray-100">
                {property.images.length > 0 ? (
                  <Image
                    src={property.images[currentImageIndex]}
                    alt={property.title}
                    fill
                    className="object-cover transition-opacity duration-300"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
                    <Building2 className="h-24 w-24 text-gray-300" />
                  </div>
                )}

                {/* Image Counter */}
                {property.images.length > 0 && (
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {currentImageIndex + 1} / {property.images.length}
                  </div>
                )}

                {/* Image Navigation */}
                {property.images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 hover:bg-white shadow-lg h-10 w-10 rounded-full"
                      onClick={() => setCurrentImageIndex(i => (i + 1) % property.images.length)}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 hover:bg-white shadow-lg h-10 w-10 rounded-full"
                      onClick={() => setCurrentImageIndex(i => (i - 1 + property.images.length) % property.images.length)}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {property.isVerified && (
                    <Badge className="bg-green-500 shadow-md">
                      <CheckCircle2 className="h-3 w-3 ml-1" />
                      موثق
                    </Badge>
                  )}
                  <Badge className={`shadow-md ${property.status === "جاهز" ? "bg-blue-500" : "bg-amber-500"}`}>
                    {property.status}
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-white/95 hover:bg-white shadow-md h-10 w-10 rounded-full"
                    onClick={toggleFavorite}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-white/95 hover:bg-white shadow-md h-10 w-10 rounded-full"
                    onClick={handleShare}
                  >
                    <Share2 className="h-5 w-5 text-gray-600" />
                  </Button>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {property.images.length > 1 && (
                <div className="p-3 bg-gray-50 border-t">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {property.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all ${idx === currentImageIndex
                          ? `ring-2 ring-${themeColor}-500 ring-offset-2`
                          : "opacity-70 hover:opacity-100"
                          }`}
                      >
                        <Image
                          src={img}
                          alt={`صورة ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Property Details - Property Finder Style */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                {/* Header with Price for Mobile */}
                <div className="lg:hidden mb-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">السعر</p>
                  <p className={`text-2xl font-bold text-${themeColor}-600`}>
                    {formatPrice(property.price)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {Math.round(property.price / property.details.area_sqm).toLocaleString()} جنيه/م²
                  </p>
                </div>

                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{property.title}</h1>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className={`h-5 w-5 text-${themeColor}-500`} />
                      <span className="font-medium">{property.location.district} - {property.location.city || city?.nameAr}</span>
                    </div>
                  </div>
                  <Badge className={`bg-${themeColor}-100 text-${themeColor}-700 border-0 text-sm px-3 py-1`}>
                    {property.type}
                  </Badge>
                </div>

                {/* Property Specifications Grid */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h3 className="font-bold text-gray-900 mb-4 text-lg">مواصفات العقار</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                      <Maximize className={`h-6 w-6 text-${themeColor}-500 mx-auto mb-2`} />
                      <p className="text-xs text-gray-500 mb-1">المساحة</p>
                      <p className="font-bold text-gray-900">{property.details.area_sqm} م²</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                      <Bed className={`h-6 w-6 text-${themeColor}-500 mx-auto mb-2`} />
                      <p className="text-xs text-gray-500 mb-1">غرف النوم</p>
                      <p className="font-bold text-gray-900">{property.details.bedrooms}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                      <Bath className={`h-6 w-6 text-${themeColor}-500 mx-auto mb-2`} />
                      <p className="text-xs text-gray-500 mb-1">الحمامات</p>
                      <p className="font-bold text-gray-900">{property.details.bathrooms}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                      <Building2 className={`h-6 w-6 text-${themeColor}-500 mx-auto mb-2`} />
                      <p className="text-xs text-gray-500 mb-1">الدور</p>
                      <p className="font-bold text-gray-900">{property.details.level}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                      <CheckCircle2 className={`h-6 w-6 text-${themeColor}-500 mx-auto mb-2`} />
                      <p className="text-xs text-gray-500 mb-1">التشطيب</p>
                      <p className="font-bold text-gray-900 text-sm">{property.details.finishing}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {property.description && (
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">وصف العقار</h3>
                    <p className="text-gray-600 leading-relaxed text-base">{property.description}</p>
                  </div>
                )}

                {/* Amenities */}
                {property.amenities.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg">المميزات والخدمات</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {property.amenities.map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                          <CheckCircle2 className={`h-4 w-4 text-${themeColor}-500 flex-shrink-0`} />
                          <span className="text-gray-700 text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Property ID & Date */}
                <div className="flex items-center justify-between pt-4 border-t text-sm text-gray-500">
                  <span>رقم العقار: {property.id}</span>
                  <span>تاريخ الإضافة: {new Date(property.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Sticky on Desktop */}
          <div className="hidden lg:block">
            <div className="sticky top-4 space-y-6">
              {/* Price Card - Property Finder Style */}
              <Card className={`shadow-xl border-0 overflow-hidden`}>
                {/* Price Header */}
                <div style={{ backgroundColor: '#064e3b' }} className="text-white p-6">
                  <p className="text-sm text-white/95 mb-1">السعر الإجمالي</p>
                  <p className="text-3xl font-bold text-white">
                    {formatPrice(property.price)}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-white/95">
                    <span className="bg-white/30 px-2 py-1 rounded text-white font-medium">
                      {Math.round(property.price / property.details.area_sqm).toLocaleString()} جنيه/م²
                    </span>
                    {property.isVerified && (
                      <span className="flex items-center gap-1 text-white">
                        <CheckCircle2 className="h-4 w-4" />
                        موثق
                      </span>
                    )}
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Payment Details */}
                  <div className="space-y-4 mb-6">
                    <h4 className="font-bold text-gray-900">تفاصيل الدفع</h4>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          طريقة الدفع
                        </span>
                        <span className="font-bold text-gray-900">{property.payment.type}</span>
                      </div>

                      {property.payment.downPayment && (
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-gray-600">المقدم</span>
                          <span className="font-bold text-green-600">
                            {property.payment.downPayment.toLocaleString()} جنيه
                          </span>
                        </div>
                      )}

                      {property.payment.monthlyInstallment && (
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-gray-600">القسط الشهري</span>
                          <span className="font-bold text-blue-600">
                            {property.payment.monthlyInstallment.toLocaleString()} جنيه
                          </span>
                        </div>
                      )}

                      {property.payment.installmentYears && (
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-gray-600 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            مدة التقسيط
                          </span>
                          <span className="font-bold text-gray-900">
                            {property.payment.installmentYears} سنوات
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Buttons */}
                  <div className="space-y-3">
                    <Button
                      className={`w-full bg-green-500 hover:bg-green-600 h-12 text-base font-bold shadow-lg`}
                      size="lg"
                      onClick={handleWhatsApp}
                    >
                      <Phone className="h-5 w-5 ml-2" />
                      تواصل عبر واتساب
                    </Button>

                    <Button
                      variant="outline"
                      className={`w-full border-${themeColor}-500 text-${themeColor}-600 hover:bg-${themeColor}-50 h-11`}
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4 ml-2" />
                      مشاركة العقار
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={toggleFavorite}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isFavorite
                        ? 'bg-red-50 text-red-600'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
                      <span className="text-sm font-medium">
                        {isFavorite ? 'تمت الإضافة للمفضلة' : 'إضافة للمفضلة'}
                      </span>
                    </button>

                    <Link
                      href={`/${citySlug}/${districtSlug}`}
                      className={`flex items-center gap-1 text-${themeColor}-600 hover:text-${themeColor}-700 text-sm font-medium`}
                    >
                      <ChevronRight className="h-4 w-4" />
                      المزيد من العقارات
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mobile Fixed Bottom Bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
            <div className="flex items-center gap-3">
              <Button
                className="flex-1 bg-green-500 hover:bg-green-600 h-12 text-base font-bold"
                onClick={handleWhatsApp}
              >
                <Phone className="h-5 w-5 ml-2" />
                تواصل واتساب
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12"
                onClick={toggleFavorite}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12"
                onClick={handleShare}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Related Properties Section */}
        {relatedProperties.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">عقارات مشابهة</h2>
                <p className="text-gray-500 text-sm mt-1">عقارات تناسب اهتماماتك بناءً على بحثك</p>
              </div>
              <Link
                href={`/${citySlug}/${districtSlug}`}
                className={`text-${themeColor}-600 hover:text-${themeColor}-700 text-sm font-medium flex items-center gap-1`}
              >
                عرض المزيد
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProperties.map((relatedProperty) => (
                <PropertyCard key={relatedProperty.id} property={relatedProperty} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
