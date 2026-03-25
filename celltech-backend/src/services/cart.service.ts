import { Prisma } from '@prisma/client';
import { HttpError } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';

const cartItemInclude = {
  inventory: {
    select: {
      skuId: true,
      partName: true,
      qualityGrade: true,
      wholesalePrice: true,
      stockLevel: true,
      category: {
        select: {
          name: true,
        },
      },
      variant: {
        select: {
          marketingName: true,
        },
      },
    },
  },
} satisfies Prisma.CartInclude;

type CartRecord = Prisma.CartGetPayload<{
  include: typeof cartItemInclude;
}>;

type DbClient = typeof prisma | Prisma.TransactionClient;

export type CartItemDto = {
  skuId: string;
  partName: string;
  category: string;
  qualityGrade: string;
  primaryModel?: string;
  quantity: number;
  addedAt: Date;
  unitPriceCents: number;
  lineTotalCents: number;
  stockAvailable: number;
  available: boolean;
};

export type CartSummaryDto = {
  items: CartItemDto[];
  subtotalCents: number;
  totalCents: number;
  itemCount: number;
};

export type AddOrUpdateCartItemInput = {
  skuId: string;
  quantity: number;
};

function createEmptyCart(): CartSummaryDto {
  return {
    items: [],
    subtotalCents: 0,
    totalCents: 0,
    itemCount: 0,
  };
}

function ensureValidQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new HttpError(422, 'Quantity must be a positive integer', 'INVALID_CART_QUANTITY');
  }
}

function ensureStockAvailable(skuId: string, requestedQuantity: number, stockLevel: number): void {
  if (requestedQuantity > stockLevel) {
    throw new HttpError(
      422,
      `Only ${stockLevel} unit${stockLevel === 1 ? '' : 's'} available for ${skuId}`,
      'INSUFFICIENT_STOCK'
    );
  }
}

function mapCartItem(item: CartRecord): CartItemDto {
  const lineTotalCents = item.quantity * item.inventory.wholesalePrice;
  const available = item.quantity <= item.inventory.stockLevel && item.inventory.stockLevel > 0;

  return {
    skuId: item.skuId,
    partName: item.inventory.partName,
    category: item.inventory.category.name,
    qualityGrade: item.inventory.qualityGrade,
    primaryModel: item.inventory.variant?.marketingName ?? undefined,
    quantity: item.quantity,
    addedAt: item.addedAt,
    unitPriceCents: item.inventory.wholesalePrice,
    lineTotalCents,
    stockAvailable: item.inventory.stockLevel,
    available,
  };
}

function buildCartSummary(items: CartRecord[]): CartSummaryDto {
  if (items.length === 0) {
    return createEmptyCart();
  }

  const mappedItems = items.map(mapCartItem);
  const subtotalCents = mappedItems.reduce((total, item) => total + item.lineTotalCents, 0);
  const itemCount = mappedItems.reduce((total, item) => total + item.quantity, 0);

  return {
    items: mappedItems,
    subtotalCents,
    totalCents: subtotalCents,
    itemCount,
  };
}

async function loadInventoryOrThrow(db: DbClient, skuId: string) {
  const inventory = await db.inventory.findUnique({
    where: { skuId },
    select: {
      skuId: true,
      stockLevel: true,
    },
  });

  if (!inventory) {
    throw new HttpError(404, 'Inventory item not found', 'INVENTORY_ITEM_NOT_FOUND');
  }

  return inventory;
}

async function loadCartItems(db: DbClient, userId: string): Promise<CartRecord[]> {
  return db.cart.findMany({
    where: { userId },
    orderBy: [
      { addedAt: 'asc' },
      { skuId: 'asc' },
    ],
    include: cartItemInclude,
  });
}

export class CartService {
  async getCart(userId: string, db: DbClient = prisma): Promise<CartSummaryDto> {
    const items = await loadCartItems(db, userId);
    return buildCartSummary(items);
  }

  async addOrUpdateItem(userId: string, input: AddOrUpdateCartItemInput): Promise<CartSummaryDto> {
    ensureValidQuantity(input.quantity);

    const items = await prisma.$transaction(async (tx) => {
      const [inventory, existingCartItem] = await Promise.all([
        loadInventoryOrThrow(tx, input.skuId),
        tx.cart.findUnique({
          where: {
            userId_skuId: {
              userId,
              skuId: input.skuId,
            },
          },
          select: {
            quantity: true,
          },
        }),
      ]);

      ensureStockAvailable(
        input.skuId,
        (existingCartItem?.quantity ?? 0) + input.quantity,
        inventory.stockLevel
      );

      const cartItem = await tx.cart.upsert({
        where: {
          userId_skuId: {
            userId,
            skuId: input.skuId,
          },
        },
        update: {
          quantity: {
            increment: input.quantity,
          },
        },
        create: {
          userId,
          skuId: input.skuId,
          quantity: input.quantity,
        },
        include: cartItemInclude,
      });

      ensureStockAvailable(input.skuId, cartItem.quantity, cartItem.inventory.stockLevel);

      return loadCartItems(tx, userId);
    });

    return buildCartSummary(items);
  }

  async updateItemQuantity(userId: string, skuId: string, quantity: number): Promise<CartSummaryDto> {
    ensureValidQuantity(quantity);

    const items = await prisma.$transaction(async (tx) => {
      const cartItem = await tx.cart.findUnique({
        where: {
          userId_skuId: {
            userId,
            skuId,
          },
        },
        include: cartItemInclude,
      });

      if (!cartItem) {
        throw new HttpError(404, 'Cart item not found', 'CART_ITEM_NOT_FOUND');
      }

      ensureStockAvailable(skuId, quantity, cartItem.inventory.stockLevel);

      await tx.cart.update({
        where: {
          userId_skuId: {
            userId,
            skuId,
          },
        },
        data: {
          quantity,
        },
      });

      return loadCartItems(tx, userId);
    });

    return buildCartSummary(items);
  }

  async removeItem(userId: string, skuId: string): Promise<CartSummaryDto> {
    const items = await prisma.$transaction(async (tx) => {
      await tx.cart.delete({
        where: {
          userId_skuId: {
            userId,
            skuId,
          },
        },
      });

      return loadCartItems(tx, userId);
    });

    return buildCartSummary(items);
  }

  async clearCart(userId: string, db: DbClient = prisma): Promise<CartSummaryDto> {
    await db.cart.deleteMany({
      where: { userId },
    });

    return createEmptyCart();
  }
}
