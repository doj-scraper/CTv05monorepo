// src/server.ts
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import path from 'path';
require('dotenv').config();

const app: Express = express();
const prisma = new PrismaClient();

// --- MIDDLEWARE ---
app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
  credentials: true,
}));
app.use(express.json());
app.use(express.static('public'));

// --- ERROR HANDLER MIDDLEWARE ---
interface CustomError extends Error {
  statusCode?: number;
}

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// --- ROUTES ---

/**
 * Search for parts by device name
 * GET /api/parts?device=iPhone17PrM
 */
app.get('/api/parts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { device } = req.query;

    if (!device || typeof device !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Device name is required',
      });
    }

    // Search in both direct links and compatibility map
    const parts = await prisma.inventory.findMany({
      where: {
        OR: [
          // Search parts directly linked to the model
          {
            model: {
              marketingName: {
                contains: device,
                mode: 'insensitive',
              },
            },
          },
          // Search parts linked via the Compatibility Map
          {
            compatibilities: {
              some: {
                model: {
                  marketingName: {
                    contains: device,
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        model: true,
        category: true,
      },
    });

    // Format response for frontend
    const formattedParts = parts.map((p) => ({
      skuId: p.skuId,
      partName: p.partName,
      category: p.category.name,
      specifications: p.specifications,
      quality: p.qualityGrade,
      price: p.wholesalePrice ? p.wholesalePrice / 100 : null,
      stock: p.stockLevel,
      modelName: p.model?.marketingName || 'Universal/Cross-Compatible',
    }));

    res.json({
      success: true,
      device,
      count: formattedParts.length,
      parts: formattedParts,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get specific part by SKU
 * GET /api/inventory/:skuId
 */
app.get('/api/inventory/:skuId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { skuId } = req.params;

    const part = await prisma.inventory.findUnique({
      where: { skuId },
      include: {
        model: true,
        category: true,
        compatibilities: {
          include: {
            model: true,
          },
        },
      },
    });

    if (!part) {
      return res.status(404).json({
        success: false,
        error: `Part ${skuId} not found`,
      });
    }

    res.json({
      success: true,
      part: {
        skuId: part.skuId,
        partName: part.partName,
        specifications: part.specifications,
        category: part.category.name,
        quality: part.qualityGrade,
        price: part.wholesalePrice ? part.wholesalePrice / 100 : null,
        stock: part.stockLevel,
        primaryModel: part.model?.marketingName || null,
        compatibleModels: part.compatibilities.map((c) => ({
          id: c.model.id,
          modelNumber: c.model.modelNumber,
          marketingName: c.model.marketingName,
          releaseYear: c.model.releaseYear,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get compatibility for a specific SKU
 * GET /api/compatibility/:skuId
 */
app.get('/api/compatibility/:skuId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { skuId } = req.params;

    const mappings = await prisma.compatibilityMap.findMany({
      where: { skuId },
      include: {
        model: true,
      },
    });

    if (mappings.length === 0) {
      // Check if it's a direct model part instead
      const part = await prisma.inventory.findUnique({
        where: { skuId },
        include: { model: true },
      });

      if (!part) {
        return res.status(404).json({
          success: false,
          error: `SKU ${skuId} not found`,
        });
      }

      // If it has a direct model, return that
      if (part.model) {
        return res.json({
          success: true,
          skuId,
          isDirectPart: true,
          model: {
            id: part.model.id,
            modelNumber: part.model.modelNumber,
            marketingName: part.model.marketingName,
            releaseYear: part.model.releaseYear,
          },
          compatibleModels: [],
        });
      }
    }

    res.json({
      success: true,
      skuId,
      isDirectPart: false,
      compatibleModels: mappings.map((m) => ({
        id: m.model.id,
        modelNumber: m.model.modelNumber,
        marketingName: m.model.marketingName,
        releaseYear: m.model.releaseYear,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get all brands
 * GET /api/brands
 */
app.get('/api/brands', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      count: brands.length,
      brands,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get models by brand (optional brandId query param)
 * GET /api/models?brandId=1
 */
app.get('/api/models', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { brandId } = req.query;

    const where = brandId ? { brandId: parseInt(brandId as string) } : {};

    const models = await prisma.model.findMany({
      where,
      include: { brand: true },
      orderBy: { marketingName: 'asc' },
    });

    res.json({
      success: true,
      count: models.length,
      models,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Health check
 * GET /api/health
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'CellTech Backend is running',
    timestamp: new Date().toISOString(),
  });
});

// --- SERVE TEST DASHBOARD ---
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// --- GRACEFUL SHUTDOWN ---
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║   🚀 CellTech Backend Server         ║
║   Running on http://localhost:${PORT}       ║
║   Dashboard: http://localhost:${PORT}/     ║
║   API Docs: /api/health              ║
╚══════════════════════════════════════╝
  `);
});

export default app;
