/**
 * API Client for CellTech Backend
 * Handles all communication with the Test backend API
 */

// Use environment variable or default to Vercel deployment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://celltech-backend.vercel.app';

export interface Brand {
  id: number;
  name: string;
}

export interface Model {
  id: number;
  brandId: number;
  modelNumber: string;
  marketingName: string;
  releaseYear: number;
  brand?: Brand;
}

export interface InventoryItem {
  skuId: string;
  partName?: string;
  specifications?: string;
  category: string;
  quality?: string;
  price?: number;
  stock: number;
  primaryModel?: string;
  compatibleModels?: Model[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

/**
 * Fetch all inventory items
 */
export async function fetchInventory(): Promise<InventoryItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inventory`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch inventory: ${response.statusText}`);
    }
    const data = await response.json();
    return data.inventory || [];
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return [];
  }
}

/**
 * Fetch inventory by model ID
 */
export async function fetchInventoryByModel(modelId: number): Promise<InventoryItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inventory/model/${modelId}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch inventory for model: ${response.statusText}`);
    }
    const data = await response.json();
    return data.parts || [];
  } catch (error) {
    console.error('Error fetching inventory by model:', error);
    return [];
  }
}

/**
 * Fetch a specific part by SKU
 */
export async function fetchPartBySku(skuId: string): Promise<InventoryItem | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inventory/${skuId}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch part: ${response.statusText}`);
    }
    const data = await response.json();
    return data.part || null;
  } catch (error) {
    console.error('Error fetching part:', error);
    return null;
  }
}

/**
 * Fetch all brands
 */
export async function fetchBrands(): Promise<Brand[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/brands`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch brands: ${response.statusText}`);
    }
    const data = await response.json();
    return data.brands || [];
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
}

/**
 * Fetch all models or filter by brand
 */
export async function fetchModels(brandId?: number): Promise<Model[]> {
  try {
    const url = brandId 
      ? `${API_BASE_URL}/api/models?brandId=${brandId}`
      : `${API_BASE_URL}/api/models`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
}

/**
 * Health check endpoint
 */
export async function searchParts(device: string) {
  const res = await fetch(`${API_BASE_URL}/api/parts?device=${encodeURIComponent(device)}`);
  if (!res.ok) throw new Error("Failed to search parts");
  return res.json();
}

export async function getPartDetails(skuId: string) {
  const res = await fetch(`${API_BASE_URL}/api/inventory/${skuId}`);
  if (!res.ok) throw new Error("Failed to fetch part details");
  return res.json();
}

export async function getCompatibility(skuId: string) {
  const res = await fetch(`${API_BASE_URL}/api/compatibility/${skuId}`);
  if (!res.ok) throw new Error("Failed to fetch compatibility");
  return res.json();
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, { cache: 'no-store' });
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}
