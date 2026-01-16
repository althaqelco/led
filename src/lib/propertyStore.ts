// lib/propertyStore.ts
// Property Store - Client-side state management for properties
// Uses Firestore for cloud persistence + localStorage as cache

import { Property } from "./mockData";
import {
  getPropertiesFromFirestore,
  getPropertyFromFirestore,
  addPropertyToFirestore,
  updatePropertyInFirestore,
  deletePropertyFromFirestore,
} from "./firestoreProperties";

const STORAGE_KEY = "eltaiseer_properties";
const CACHE_TIMESTAMP_KEY = "eltaiseer_properties_timestamp";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Check if cache is valid
function isCacheValid(): boolean {
  if (typeof window === "undefined") return false;
  const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  if (!timestamp) return false;
  return Date.now() - parseInt(timestamp) < CACHE_DURATION;
}

// Get cached properties from localStorage
function getCachedProperties(): Property[] | null {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isCacheValid()) {
      const parsed = JSON.parse(stored);
      return parsed.map((p: Property) => ({
        ...p,
        createdAt: new Date(p.createdAt),
      }));
    }
  } catch (error) {
    console.error("Error loading properties from cache:", error);
  }
  return null;
}

// Save properties to localStorage cache
function saveToCache(props: Property[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(props));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error("Error saving properties to cache:", error);
  }
}

// Clear cache to force refresh
export function clearPropertiesCache(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CACHE_TIMESTAMP_KEY);
}

// Get all properties (sync version - returns cached or empty)
export function getAllProperties(): Property[] {
  if (typeof window === "undefined") {
    return [];
  }
  
  // Try to get from cache first
  const cached = getCachedProperties();
  if (cached && cached.length > 0) {
    return cached;
  }
  
  // Return empty array - async fetch will update
  return [];
}

// Get all properties from Firestore (async version)
export async function getAllPropertiesAsync(): Promise<Property[]> {
  try {
    const properties = await getPropertiesFromFirestore();
    
    // If Firestore has data, use it
    if (properties.length > 0) {
      saveToCache(properties);
      return properties;
    }
    
    // No fallback - return empty if no data
    return [];
  } catch (error) {
    console.error("Error fetching properties:", error);
    
    // Try cache
    const cached = getCachedProperties();
    if (cached) return cached;
    
    // Final fallback - return empty or cached
    return cached || [];
  }
}

// Get property by ID (sync version)
export function getPropertyById(id: string): Property | undefined {
  return getAllProperties().find((p) => p.id === id);
}

// Get property by ID (async version)
export async function getPropertyByIdAsync(id: string): Promise<Property | null> {
  try {
    const property = await getPropertyFromFirestore(id);
    if (property) return property;
    
    // Fallback to local search
    return getAllProperties().find((p) => p.id === id) || null;
  } catch (error) {
    console.error("Error fetching property:", error);
    return getAllProperties().find((p) => p.id === id) || null;
  }
}

// Add new property (saves to Firestore)
export async function addPropertyAsync(
  property: Omit<Property, "id" | "createdAt">
): Promise<{ success: boolean; property?: Property; error?: string }> {
  try {
    const result = await addPropertyToFirestore(property);
    if (result.success && result.property) {
      clearPropertiesCache(); // Clear cache to force refresh
      return { success: true, property: result.property };
    }
    return { success: false, error: result.error || 'فشل في إضافة العقار' };
  } catch (error) {
    console.error("Error adding property:", error);
    return { success: false, error: 'حدث خطأ أثناء إضافة العقار' };
  }
}

// Legacy sync add (for backward compatibility - also saves to Firestore)
export function addProperty(property: Omit<Property, "id" | "createdAt">): Property {
  // Fire and forget - async save to Firestore
  addPropertyAsync(property).catch(console.error);
  
  // Return immediately with temporary ID
  const tempProperty: Property = {
    ...property,
    id: `temp-${Date.now()}`,
    createdAt: new Date(),
  };
  return tempProperty;
}

// Update property (async)
export async function updatePropertyAsync(
  id: string, 
  updates: Partial<Property>
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await updatePropertyInFirestore(id, updates);
    if (result.success) {
      clearPropertiesCache();
    }
    return result;
  } catch (error) {
    console.error("Error updating property:", error);
    return { success: false, error: 'حدث خطأ أثناء تحديث العقار' };
  }
}

// Legacy sync update
export function updateProperty(id: string, updates: Partial<Property>): Property | null {
  updatePropertyAsync(id, updates).catch(console.error);
  return { ...updates, id } as Property;
}

// Delete property (async)
export async function deletePropertyAsync(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await deletePropertyFromFirestore(id);
    if (result.success) {
      clearPropertiesCache();
    }
    return result;
  } catch (error) {
    console.error("Error deleting property:", error);
    return { success: false, error: 'حدث خطأ أثناء حذف العقار' };
  }
}

// Legacy sync delete
export function deleteProperty(id: string): boolean {
  deletePropertyAsync(id).catch(console.error);
  return true;
}

// Get properties with pagination
export function getPropertiesPage(
  page: number,
  limit: number,
  filters?: {
    district?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
  }
): { properties: Property[]; total: number; totalPages: number } {
  let filtered = [...getAllProperties()];

  if (filters?.district) {
    filtered = filtered.filter((p) => p.location.district === filters.district);
  }
  if (filters?.type) {
    filtered = filtered.filter((p) => p.type === filters.type);
  }
  if (filters?.minPrice) {
    filtered = filtered.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters?.maxPrice) {
    filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    properties: filtered.slice(start, end),
    total,
    totalPages,
  };
}

// Calculate similarity score between two properties (0-100%)
export function calculateSimilarity(property1: Property, property2: Property): number {
  let score = 0;
  let maxScore = 0;
  
  // Same city (weight: 15)
  maxScore += 15;
  if (property1.location.cityId === property2.location.cityId) {
    score += 15;
  }
  
  // Same district (weight: 20)
  maxScore += 20;
  if (property1.location.district === property2.location.district) {
    score += 20;
  }
  
  // Same type (weight: 25)
  maxScore += 25;
  if (property1.type === property2.type) {
    score += 25;
  }
  
  // Price similarity (weight: 15) - within 30% range
  maxScore += 15;
  const priceDiff = Math.abs(property1.price - property2.price);
  const avgPrice = (property1.price + property2.price) / 2;
  const priceRatio = priceDiff / avgPrice;
  if (priceRatio <= 0.1) score += 15;
  else if (priceRatio <= 0.2) score += 12;
  else if (priceRatio <= 0.3) score += 8;
  else if (priceRatio <= 0.5) score += 4;
  
  // Area similarity (weight: 10) - within 30% range
  maxScore += 10;
  const areaDiff = Math.abs(property1.details.area_sqm - property2.details.area_sqm);
  const avgArea = (property1.details.area_sqm + property2.details.area_sqm) / 2;
  const areaRatio = areaDiff / avgArea;
  if (areaRatio <= 0.1) score += 10;
  else if (areaRatio <= 0.2) score += 8;
  else if (areaRatio <= 0.3) score += 5;
  else if (areaRatio <= 0.5) score += 2;
  
  // Bedrooms similarity (weight: 8)
  maxScore += 8;
  const bedroomDiff = Math.abs(property1.details.bedrooms - property2.details.bedrooms);
  if (bedroomDiff === 0) score += 8;
  else if (bedroomDiff === 1) score += 5;
  else if (bedroomDiff === 2) score += 2;
  
  // Same status (weight: 5)
  maxScore += 5;
  if (property1.status === property2.status) {
    score += 5;
  }
  
  // Same payment type (weight: 2)
  maxScore += 2;
  if (property1.payment.type === property2.payment.type) {
    score += 2;
  }
  
  return Math.round((score / maxScore) * 100);
}

// Get related properties with smart similarity algorithm (90% threshold)
export function getRelatedProperties(property: Property, limit: number = 4): Property[] {
  const allProperties = getAllProperties();
  
  // Calculate similarity for all properties
  const withSimilarity = allProperties
    .filter((p: Property) => p.id !== property.id)
    .map((p: Property) => ({
      property: p,
      similarity: calculateSimilarity(property, p)
    }))
    .sort((a, b) => b.similarity - a.similarity);
  
  // Get top matches (prioritize 90%+ similarity, but return best available)
  const highSimilarity = withSimilarity.filter(item => item.similarity >= 90);
  
  if (highSimilarity.length >= limit) {
    return highSimilarity.slice(0, limit).map(item => item.property);
  }
  
  // If not enough 90%+ matches, get the best available
  return withSimilarity.slice(0, limit).map(item => item.property);
}

// Get related properties async version - from Firestore only
export async function getRelatedPropertiesAsync(property: Property, limit: number = 4): Promise<Property[]> {
  try {
    // Get properties directly from Firestore only (no cache/mock fallback)
    const allProperties = await getPropertiesFromFirestore();
    
    // If no properties in Firestore, return empty array
    if (!allProperties || allProperties.length === 0) {
      return [];
    }
    
    const withSimilarity = allProperties
      .filter((p: Property) => p.id !== property.id)
      .map((p: Property) => ({
        property: p,
        similarity: calculateSimilarity(property, p)
      }))
      .sort((a, b) => b.similarity - a.similarity);
    
    return withSimilarity.slice(0, limit).map(item => item.property);
  } catch (error) {
    console.error("Error fetching related properties from Firestore:", error);
    return [];
  }
}

// Get featured properties (verified ones)
export function getFeaturedProperties(limit: number = 6): Property[] {
  return getAllProperties().filter((p: Property) => p.isVerified).slice(0, limit);
}

// Get latest properties
export function getLatestProperties(limit: number = 6): Property[] {
  return [...getAllProperties()]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

// Generate unique ID
export function generatePropertyId(): string {
  return `prop-${String(getAllProperties().length + 1).padStart(3, "0")}`;
}

// Clear all data and reset to mock data
export function resetToMockData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
