"use client";

import { useEffect, useState } from 'react';
import { fetchInventory, fetchBrands, fetchModels, InventoryItem, Brand, Model } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [inventoryData, brandsData, modelsData] = await Promise.all([
          fetchInventory(),
          fetchBrands(),
          fetchModels(),
        ]);

        setInventory(inventoryData);
        setBrands(brandsData);
        setModels(modelsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load inventory');
        console.error('Error loading inventory:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter inventory based on selected brand/model
  const filteredInventory = inventory.filter((item) => {
    if (selectedModel) {
      return item.compatibleModels?.some((m) => m.id === selectedModel) || 
             (item.primaryModel && models.find((m) => m.id === selectedModel)?.marketingName === item.primaryModel);
    }
    if (selectedBrand) {
      // Find all models for this brand
      const brandModelIds = models.filter(m => m.brandId === selectedBrand).map(m => m.id);
      const brandModelNames = models.filter(m => m.brandId === selectedBrand).map(m => m.marketingName);
      
      return item.compatibleModels?.some((m) => brandModelIds.includes(m.id)) || 
             (item.primaryModel && brandModelNames.includes(item.primaryModel));
    }
    return true;
  });

  const filteredModels = selectedBrand 
    ? models.filter((m) => m.brandId === selectedBrand)
    : models;

  return (
    <div className="pt-16 pb-20">
        {/* Header */}
        <div className="px-6 lg:px-12 mb-8">
          <h1 className="heading-display text-3xl sm:text-4xl lg:text-5xl text-ct-text mb-2">
            PARTS <span className="text-ct-accent">INVENTORY</span>
          </h1>
          <p className="text-ct-text-secondary text-sm lg:text-base">
            Browse our complete database of wholesale cell phone parts and components.
          </p>
        </div>

        {/* Filters */}
        <div className="px-6 lg:px-12 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ct-text mb-2">Brand</label>
            <select
              value={selectedBrand || ''}
              onChange={(e) => {
                setSelectedBrand(e.target.value ? parseInt(e.target.value) : null);
                setSelectedModel(null);
              }}
              className="w-full px-4 py-2 rounded-lg bg-ct-bg-secondary border border-ct-text/10 text-ct-text"
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ct-text mb-2">Model</label>
            <select
              value={selectedModel || ''}
              onChange={(e) => setSelectedModel(e.target.value ? parseInt(e.target.value) : null)}
              disabled={!selectedBrand && models.length === 0}
              className="w-full px-4 py-2 rounded-lg bg-ct-bg-secondary border border-ct-text/10 text-ct-text disabled:opacity-50"
            >
              <option value="">All Models</option>
              {filteredModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.marketingName} ({model.modelNumber})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 lg:px-12">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-ct-accent animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-red-400">
              <p className="font-medium">Error Loading Inventory</p>
              <p className="text-sm mt-1">{error}</p>
              <p className="text-xs mt-3 text-red-400/70">
                Make sure the backend API is running at: <code className="bg-red-500/5 px-2 py-1 rounded">https://celltech-backend.vercel.app</code>
              </p>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-ct-text-secondary">No parts found matching your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ct-text/10">
                    <th className="text-left py-3 px-4 font-semibold text-ct-text">SKU</th>
                    <th className="text-left py-3 px-4 font-semibold text-ct-text">Part Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-ct-text">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-ct-text">Model</th>
                    <th className="text-right py-3 px-4 font-semibold text-ct-text">Price</th>
                    <th className="text-right py-3 px-4 font-semibold text-ct-text">Stock</th>
                    <th className="text-left py-3 px-4 font-semibold text-ct-text">Quality</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.skuId} className="border-b border-ct-text/5 hover:bg-ct-bg-secondary/30 transition-colors">
                      <td className="py-3 px-4 text-ct-accent font-mono">{item.skuId}</td>
                      <td className="py-3 px-4 text-ct-text">{item.partName || 'N/A'}</td>
                      <td className="py-3 px-4 text-ct-text-secondary">{item.category}</td>
                      <td className="py-3 px-4 text-ct-text-secondary">{item.primaryModel || 'Cross-Compatible'}</td>
                      <td className="py-3 px-4 text-right text-ct-accent font-semibold">
                        {item.price ? `$${item.price.toFixed(2)}` : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          item.stock > 10 
                            ? 'bg-green-500/10 text-green-400'
                            : item.stock > 0
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {item.stock} units
                        </span>
                      </td>
                      <td className="py-3 px-4 text-ct-text-secondary">{item.quality || 'Standard'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary */}
          {!loading && !error && filteredInventory.length > 0 && (
            <div className="mt-6 p-4 bg-ct-bg-secondary/30 rounded-lg border border-ct-text/5">
              <p className="text-sm text-ct-text-secondary">
                Showing <span className="text-ct-accent font-semibold">{filteredInventory.length}</span> parts
                {selectedBrand && ` from ${brands.find((b) => b.id === selectedBrand)?.name}`}
                {selectedModel && ` for ${models.find((m) => m.id === selectedModel)?.marketingName}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
