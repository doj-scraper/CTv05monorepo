// prisma/seed.ts
import { PrismaClient, QualityGrade } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - comment out if you want to keep data)
  // await prisma.compatibilityMap.deleteMany({});
  // await prisma.inventory.deleteMany({});
  // await prisma.model.deleteMany({});
  // await prisma.category.deleteMany({});
  // await prisma.brand.deleteMany({});

  // --- 1. CREATE BRANDS ---
  const apple = await prisma.brand.upsert({
    where: { name: 'Apple' },
    update: {},
    create: { name: 'Apple' },
  });

  const samsung = await prisma.brand.upsert({
    where: { name: 'Samsung' },
    update: {},
    create: { name: 'Samsung' },
  });

  console.log('✅ Brands created');

  // --- 2. CREATE CATEGORIES ---
  const catBattery = await prisma.category.upsert({
    where: { name: 'Battery' },
    update: {},
    create: { name: 'Battery' },
  });

  const catChargingPort = await prisma.category.upsert({
    where: { name: 'Charging Port' },
    update: {},
    create: { name: 'Charging Port' },
  });

  const catCamera = await prisma.category.upsert({
    where: { name: 'Camera' },
    update: {},
    create: { name: 'Camera' },
  });

  const catDisplay = await prisma.category.upsert({
    where: { name: 'Display' },
    update: {},
    create: { name: 'Display' },
  });

  console.log('✅ Categories created');

  // --- 3. CREATE APPLE MODELS ---
  const ip17PrM = await prisma.model.upsert({
    where: { modelNumber: 'A3257' },
    update: {},
    create: {
      brandId: apple.id,
      modelNumber: 'A3257',
      marketingName: 'iPhone 17 Pro Max',
      releaseYear: 2025,
    },
  });

  const ip17Pr = await prisma.model.upsert({
    where: { modelNumber: 'A3256' },
    update: {},
    create: {
      brandId: apple.id,
      modelNumber: 'A3256',
      marketingName: 'iPhone 17 Pro',
      releaseYear: 2025,
    },
  });

  const ip17 = await prisma.model.upsert({
    where: { modelNumber: 'A3258' },
    update: {},
    create: {
      brandId: apple.id,
      modelNumber: 'A3258',
      marketingName: 'iPhone 17',
      releaseYear: 2025,
    },
  });

  const ip16PrM = await prisma.model.upsert({
    where: { modelNumber: 'A3084' },
    update: {},
    create: {
      brandId: apple.id,
      modelNumber: 'A3084',
      marketingName: 'iPhone 16 Pro Max',
      releaseYear: 2024,
    },
  });

  const ip13 = await prisma.model.upsert({
    where: { modelNumber: 'A2482' },
    update: {},
    create: {
      brandId: apple.id,
      modelNumber: 'A2482',
      marketingName: 'iPhone 13',
      releaseYear: 2021,
    },
  });

  const ip14 = await prisma.model.upsert({
    where: { modelNumber: 'A2649' },
    update: {},
    create: {
      brandId: apple.id,
      modelNumber: 'A2649',
      marketingName: 'iPhone 14',
      releaseYear: 2022,
    },
  });

  console.log('✅ Apple models created');

  // --- 4. CREATE SAMSUNG MODELS ---
  const s25Ultra = await prisma.model.upsert({
    where: { modelNumber: 'SM-S928' },
    update: {},
    create: {
      brandId: samsung.id,
      modelNumber: 'SM-S928',
      marketingName: 'Galaxy S25 Ultra',
      releaseYear: 2025,
    },
  });

  const s25 = await prisma.model.upsert({
    where: { modelNumber: 'SM-S921' },
    update: {},
    create: {
      brandId: samsung.id,
      modelNumber: 'SM-S921',
      marketingName: 'Galaxy S25',
      releaseYear: 2025,
    },
  });

  const zFold6 = await prisma.model.upsert({
    where: { modelNumber: 'SM-F956' },
    update: {},
    create: {
      brandId: samsung.id,
      modelNumber: 'SM-F956',
      marketingName: 'Galaxy Z Fold 6',
      releaseYear: 2024,
    },
  });

  console.log('✅ Samsung models created');

  // --- 5. CREATE INVENTORY PARTS ---

  // iPhone 17 Pro Max - Battery
  await prisma.inventory.upsert({
    where: { skuId: 'IF17PrM-3-MOD-BAT' },
    update: { stockLevel: 150 },
    create: {
      skuId: 'IF17PrM-3-MOD-BAT',
      modelId: ip17PrM.id,
      categoryId: catBattery.id,
      partName: 'Replacement Battery',
      specifications: 'Lithium-Ion, Adhesive | Capacity: Not specified | Playback: 37 hours',
      qualityGrade: 'Premium',
      wholesalePrice: 2500,
      stockLevel: 150,
    },
  });

  // iPhone 17 Pro Max - Charging Port
  await prisma.inventory.upsert({
    where: { skuId: 'IF17PrM-3-MOD-CHG' },
    update: { stockLevel: 200 },
    create: {
      skuId: 'IF17PrM-3-MOD-CHG',
      modelId: ip17PrM.id,
      categoryId: catChargingPort.id,
      partName: 'Charge Port Assembly',
      specifications: 'Type: USB-C | Specs: USB 3.0',
      qualityGrade: 'OEM',
      wholesalePrice: 1800,
      stockLevel: 200,
    },
  });

  // iPhone 17 Pro Max - Camera
  await prisma.inventory.upsert({
    where: { skuId: 'IF17PrM-3-MOD-CAM' },
    update: { stockLevel: 75 },
    create: {
      skuId: 'IF17PrM-3-MOD-CAM',
      modelId: ip17PrM.id,
      categoryId: catCamera.id,
      partName: 'Camera Array',
      specifications: 'Rear: 48MP Fusion Main + 48MP Ultra Wide + 48MP Telephoto | Front: 18MP',
      qualityGrade: 'OEM',
      wholesalePrice: 9500,
      stockLevel: 75,
    },
  });

  // iPhone 16 Pro Max - Battery
  await prisma.inventory.upsert({
    where: { skuId: 'IF16PrM-3-MOD-BAT' },
    update: { stockLevel: 120 },
    create: {
      skuId: 'IF16PrM-3-MOD-BAT',
      modelId: ip16PrM.id,
      categoryId: catBattery.id,
      partName: 'Replacement Battery',
      specifications: 'Lithium-Ion, Adhesive | Capacity: 4685 mAh | Playback: 33 hours',
      qualityGrade: 'Premium',
      wholesalePrice: 2200,
      stockLevel: 120,
    },
  });

  // Cross-Compatible Display (iPhone 13/14)
  const masterScreen = await prisma.inventory.upsert({
    where: { skuId: 'IF13-14-1-DIS-OLED' },
    update: { stockLevel: 300 },
    create: {
      skuId: 'IF13-14-1-DIS-OLED',
      categoryId: catDisplay.id,
      partName: 'OLED Display Assembly',
      specifications: '6.1" Super Retina XDR OLED | 60Hz | Cross-Compatible',
      qualityGrade: 'Aftermarket',
      wholesalePrice: 4500,
      stockLevel: 300,
    },
  });

  // Samsung S25 Ultra - Battery
  await prisma.inventory.upsert({
    where: { skuId: 'SGP25U-3-MOD-BAT' },
    update: { stockLevel: 180 },
    create: {
      skuId: 'SGP25U-3-MOD-BAT',
      modelId: s25Ultra.id,
      categoryId: catBattery.id,
      partName: 'Replacement Battery',
      specifications: 'Lithium-Ion | Capacity: 5000 mAh | 45W Fast Charging',
      qualityGrade: 'Premium',
      wholesalePrice: 2200,
      stockLevel: 180,
    },
  });

  // Samsung Galaxy Z Fold 6 - Battery
  await prisma.inventory.upsert({
    where: { skuId: 'SZF6-3-MOD-BAT' },
    update: { stockLevel: 60 },
    create: {
      skuId: 'SZF6-3-MOD-BAT',
      modelId: zFold6.id,
      categoryId: catBattery.id,
      partName: 'Replacement Battery',
      specifications: 'Lithium-Ion (Dual Cell) | Capacity: 4400 mAh | 25W Fast Charging',
      qualityGrade: 'Premium',
      wholesalePrice: 2800,
      stockLevel: 60,
    },
  });

  console.log('✅ Inventory parts created');

  // --- 6. CREATE CROSS-COMPATIBILITY MAPPINGS ---
  await prisma.compatibilityMap.upsert({
    where: { skuId_compatibleModelId: { skuId: 'IF13-14-1-DIS-OLED', compatibleModelId: ip13.id } },
    update: {},
    create: {
      skuId: 'IF13-14-1-DIS-OLED',
      compatibleModelId: ip13.id,
    },
  });

  await prisma.compatibilityMap.upsert({
    where: { skuId_compatibleModelId: { skuId: 'IF13-14-1-DIS-OLED', compatibleModelId: ip14.id } },
    update: {},
    create: {
      skuId: 'IF13-14-1-DIS-OLED',
      compatibleModelId: ip14.id,
    },
  });

  console.log('✅ Compatibility mappings created');

  console.log(`
╔════════════════════════════════════╗
║   🎉 Seeding Complete!             ║
║                                    ║
║   📊 Data Summary:                 ║
║   - Brands: 2                      ║
║   - Models: 9                      ║
║   - Categories: 4                  ║
║   - Inventory Parts: 8             ║
║   - Compatibility Mappings: 2      ║
╚════════════════════════════════════╝
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
