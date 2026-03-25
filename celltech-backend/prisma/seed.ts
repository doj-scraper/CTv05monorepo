// celltech-backend/prisma/seed.ts
import { PrismaClient, QualityGrade } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

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

  // --- 3. CREATE APPLE MODEL TYPES ---
  const appleIPhone = await prisma.modelType.upsert({
    where: { brandId_name: { brandId: apple.id, name: 'iPhone' } },
    update: {},
    create: {
      brandId: apple.id,
      name: 'iPhone',
    },
  });

  console.log('✅ Apple model types created');

  // --- 4. CREATE APPLE GENERATIONS ---
  const gen17PrM = await prisma.generation.upsert({
    where: { modelTypeId_name: { modelTypeId: appleIPhone.id, name: '17 Pro Max' } },
    update: {},
    create: {
      modelTypeId: appleIPhone.id,
      name: '17 Pro Max',
      releaseYear: 2025,
    },
  });

  const gen17Pr = await prisma.generation.upsert({
    where: { modelTypeId_name: { modelTypeId: appleIPhone.id, name: '17 Pro' } },
    update: {},
    create: {
      modelTypeId: appleIPhone.id,
      name: '17 Pro',
      releaseYear: 2025,
    },
  });

  const gen17 = await prisma.generation.upsert({
    where: { modelTypeId_name: { modelTypeId: appleIPhone.id, name: '17' } },
    update: {},
    create: {
      modelTypeId: appleIPhone.id,
      name: '17',
      releaseYear: 2025,
    },
  });

  const gen16PrM = await prisma.generation.upsert({
    where: { modelTypeId_name: { modelTypeId: appleIPhone.id, name: '16 Pro Max' } },
    update: {},
    create: {
      modelTypeId: appleIPhone.id,
      name: '16 Pro Max',
      releaseYear: 2024,
    },
  });

  const gen13 = await prisma.generation.upsert({
    where: { modelTypeId_name: { modelTypeId: appleIPhone.id, name: '13' } },
    update: {},
    create: {
      modelTypeId: appleIPhone.id,
      name: '13',
      releaseYear: 2021,
    },
  });

  const gen14 = await prisma.generation.upsert({
    where: { modelTypeId_name: { modelTypeId: appleIPhone.id, name: '14' } },
    update: {},
    create: {
      modelTypeId: appleIPhone.id,
      name: '14',
      releaseYear: 2022,
    },
  });

  console.log('✅ Apple generations created');

  // --- 5. CREATE APPLE VARIANTS ---
  const ip17PrM = await prisma.variant.upsert({
    where: { modelNumber: 'A3257' },
    update: {},
    create: {
      generationId: gen17PrM.id,
      modelNumber: 'A3257',
      marketingName: 'iPhone 17 Pro Max',
    },
  });

  const ip17Pr = await prisma.variant.upsert({
    where: { modelNumber: 'A3256' },
    update: {},
    create: {
      generationId: gen17Pr.id,
      modelNumber: 'A3256',
      marketingName: 'iPhone 17 Pro',
    },
  });

  const ip17 = await prisma.variant.upsert({
    where: { modelNumber: 'A3258' },
    update: {},
    create: {
      generationId: gen17.id,
      modelNumber: 'A3258',
      marketingName: 'iPhone 17',
    },
  });

  const ip16PrM = await prisma.variant.upsert({
    where: { modelNumber: 'A3084' },
    update: {},
    create: {
      generationId: gen16PrM.id,
      modelNumber: 'A3084',
      marketingName: 'iPhone 16 Pro Max',
    },
  });

  const ip13 = await prisma.variant.upsert({
    where: { modelNumber: 'A2482' },
    update: {},
    create: {
      generationId: gen13.id,
      modelNumber: 'A2482',
      marketingName: 'iPhone 13',
    },
  });

  const ip14 = await prisma.variant.upsert({
    where: { modelNumber: 'A2649' },
    update: {},
    create: {
      generationId: gen14.id,
      modelNumber: 'A2649',
      marketingName: 'iPhone 14',
    },
  });

  console.log('✅ Apple variants created');

  // --- 6. CREATE SAMSUNG MODEL TYPES ---
  const samsungGalaxyS = await prisma.modelType.upsert({
    where: { brandId_name: { brandId: samsung.id, name: 'Galaxy S' } },
    update: {},
    create: {
      brandId: samsung.id,
      name: 'Galaxy S',
    },
  });

  const samsungGalaxyZ = await prisma.modelType.upsert({
    where: { brandId_name: { brandId: samsung.id, name: 'Galaxy Z' } },
    update: {},
    create: {
      brandId: samsung.id,
      name: 'Galaxy Z',
    },
  });

  console.log('✅ Samsung model types created');

  // --- 7. CREATE SAMSUNG GENERATIONS ---
  const genS25Ultra = await prisma.generation.upsert({
    where: { modelTypeId_name: { modelTypeId: samsungGalaxyS.id, name: 'S25 Ultra' } },
    update: {},
    create: {
      modelTypeId: samsungGalaxyS.id,
      name: 'S25 Ultra',
      releaseYear: 2025,
    },
  });

  const genS25 = await prisma.generation.upsert({
    where: { modelTypeId_name: { modelTypeId: samsungGalaxyS.id, name: 'S25' } },
    update: {},
    create: {
      modelTypeId: samsungGalaxyS.id,
      name: 'S25',
      releaseYear: 2025,
    },
  });

  const genZFold6 = await prisma.generation.upsert({
    where: { modelTypeId_name: { modelTypeId: samsungGalaxyZ.id, name: 'Fold 6' } },
    update: {},
    create: {
      modelTypeId: samsungGalaxyZ.id,
      name: 'Fold 6',
      releaseYear: 2024,
    },
  });

  console.log('✅ Samsung generations created');

  // --- 8. CREATE SAMSUNG VARIANTS ---
  const s25Ultra = await prisma.variant.upsert({
    where: { modelNumber: 'SM-S928' },
    update: {},
    create: {
      generationId: genS25Ultra.id,
      modelNumber: 'SM-S928',
      marketingName: 'Galaxy S25 Ultra',
    },
  });

  const s25 = await prisma.variant.upsert({
    where: { modelNumber: 'SM-S921' },
    update: {},
    create: {
      generationId: genS25.id,
      modelNumber: 'SM-S921',
      marketingName: 'Galaxy S25',
    },
  });

  const zFold6 = await prisma.variant.upsert({
    where: { modelNumber: 'SM-F956' },
    update: {},
    create: {
      generationId: genZFold6.id,
      modelNumber: 'SM-F956',
      marketingName: 'Galaxy Z Fold 6',
    },
  });

  console.log('✅ Samsung variants created');

  // --- 9. CREATE INVENTORY PARTS ---

  // iPhone 17 Pro Max - Battery
  await prisma.inventory.upsert({
    where: { skuId: 'IF17PrM-3-MOD-BAT' },
    update: { stockLevel: 150 },
    create: {
      skuId: 'IF17PrM-3-MOD-BAT',
      variantId: ip17PrM.id,
      categoryId: catBattery.id,
      partName: 'Replacement Battery',
      qualityGrade: QualityGrade.Premium,
      wholesalePrice: 2500,
      stockLevel: 150,
    },
  });

  await prisma.specification.upsert({
    where: { skuId_label: { skuId: 'IF17PrM-3-MOD-BAT', label: 'Type' } },
    update: { value: 'Lithium-Ion, Adhesive' },
    create: {
      skuId: 'IF17PrM-3-MOD-BAT',
      label: 'Type',
      value: 'Lithium-Ion, Adhesive',
    },
  });

  await prisma.specification.upsert({
    where: { skuId_label: { skuId: 'IF17PrM-3-MOD-BAT', label: 'Capacity' } },
    update: { value: 'Not specified' },
    create: {
      skuId: 'IF17PrM-3-MOD-BAT',
      label: 'Capacity',
      value: 'Not specified',
    },
  });

  await prisma.specification.upsert({
    where: { skuId_label: { skuId: 'IF17PrM-3-MOD-BAT', label: 'Playback' } },
    update: { value: '37 hours' },
    create: {
      skuId: 'IF17PrM-3-MOD-BAT',
      label: 'Playback',
      value: '37 hours',
    },
  });

  // iPhone 17 Pro Max - Charging Port
  await prisma.inventory.upsert({
    where: { skuId: 'IF17PrM-3-MOD-CHG' },
    update: { stockLevel: 200 },
    create: {
      skuId: 'IF17PrM-3-MOD-CHG',
      variantId: ip17PrM.id,
      categoryId: catChargingPort.id,
      partName: 'Charge Port Assembly',
      qualityGrade: QualityGrade.OEM,
      wholesalePrice: 1800,
      stockLevel: 200,
    },
  });

  await prisma.specification.upsert({
    where: { skuId_label: { skuId: 'IF17PrM-3-MOD-CHG', label: 'Type' } },
    update: { value: 'USB-C' },
    create: {
      skuId: 'IF17PrM-3-MOD-CHG',
      label: 'Type',
      value: 'USB-C',
    },
  });

  await prisma.specification.upsert({
    where: { skuId_label: { skuId: 'IF17PrM-3-MOD-CHG', label: 'Specs' } },
    update: { value: 'USB 3.0' },
    create: {
      skuId: 'IF17PrM-3-MOD-CHG',
      label: 'Specs',
      value: 'USB 3.0',
    },
  });

  // iPhone 17 Pro Max - Camera
  await prisma.inventory.upsert({
    where: { skuId: 'IF17PrM-3-MOD-CAM' },
    update: { stockLevel: 75 },
    create: {
      skuId: 'IF17PrM-3-MOD-CAM',
      variantId: ip17PrM.id,
      categoryId: catCamera.id,
      partName: 'Camera Array',
      qualityGrade: QualityGrade.OEM,
      wholesalePrice: 9500,
      stockLevel: 75,
    },
  });

  await prisma.specification.upsert({
    where: { skuId_label: { skuId: 'IF17PrM-3-MOD-CAM', label: 'Rear' } },
    update: { value: '48MP Fusion Main + 48MP Ultra Wide + 48MP Telephoto' },
    create: {
      skuId: 'IF17PrM-3-MOD-CAM',
      label: 'Rear',
      value: '48MP Fusion Main + 48MP Ultra Wide + 48MP Telephoto',
    },
  });

  await prisma.specification.upsert({
    where: { skuId_label: { skuId: 'IF17PrM-3-MOD-CAM', label: 'Front' } },
    update: { value: '18MP' },
    create: {
      skuId: 'IF17PrM-3-MOD-CAM',
      label: 'Front',
      value: '18MP',
    },
  });

  // iPhone 16 Pro Max - Battery
  await prisma.inventory.upsert({
    where: { skuId: 'IF16PrM-3-MOD-BAT' },
    update: { stockLevel: 120 },
    create: {
      skuId: 'IF16PrM-3-MOD-BAT',
      variantId: ip16PrM.id,
      categoryId: catBattery.id,
      partName: 'Replacement Battery',
      qualityGrade: QualityGrade.Premium,
      wholesalePrice: 2200,
      stockLevel: 120,
    },
  });

  await prisma.specification.upsert({
    where: { skuId_label: { skuId: 'IF16PrM-3-MOD-BAT', label: 'Type' } },
    update: { value: 'Lithium-Ion, Adhesive' },
    create: {
      skuId: 'IF16PrM-3-MOD-BAT',
      label: 'Type',
      value: 'Lithium-Ion, Adhesive',
    },
  });

  await prisma.specification.upsert({
    where: { skuId_label: { skuId: 'IF16PrM-3-MOD-BAT', label: 'Capacity' } },
    update: { value: '4685 mAh' },
    create: {
      skuId: 'IF16PrM-3-MOD-BAT',
      label: 'Capacity',
      value: '4685 mAh',
    },
  });

  await prisma.specification.upsert({
    where: { skuId_label: { skuId: 'IF16PrM-3-MOD-BAT', label: 'Playback' } },
    update: { value: '33 hours' },
    create: {
      skuId: 'IF16PrM-3-MOD-BAT',
      label: 'Playback',
      value: '33 hours',
    },
  });

  // Cross-Compatible Display (iPhone 13/14)
  await prisma.inventory.upsert({
    where: { skuId: 'IF13-14-1-DIS-OLED' },
    update: { stockLevel: 300 },
    create: {
      skuId: 'IF13-14-1-DIS-OLED',
      categoryId: catDisplay.id,
      partName: 'OLED Display Assembly',
      qualityGrade: QualityGrade.Aftermarket,
      wholesalePrice: 4500,
      stockLevel: 300,
    },
  });

  await prisma.specification.upsert({
    where: { skuId_label: { skuId: 'IF13-14-1-DIS-OLED', label: 'Size' } },
    update: { value: '6.1"' },
    create: {
      skuId: 'IF13-14-1-DIS-OLED',
      label: 'Size',
      value: '6.1"',
    },
  });

  await prisma.specification.upsert({
    where: { skuId_label: { skuId: 'IF13-14-1-DIS-OLED', label: 'Type' } },
    update: { value: 'Super Retina XDR OLED' },
    create: {
      skuId: 'IF13-14-1-DIS-OLED',
      label: 'Type',
      value: 'Super Retina XDR OLED',
    },
  });

  await prisma.specification.upsert({
    where: { skuId_label: { skuId: 'IF13-14-1-DIS-OLED', label: 'Refresh Rate' } },
    update: { value: '60Hz' },
    create: {
      skuId: 'IF13-14-1-DIS-OLED',
      label: 'Refresh Rate',
      value: '60Hz',
    },
  });

  await prisma.specification.upsert({
    where: { skuId_label: { skuId: 'IF13-14-1-DIS-OLED', label: 'Compatibility' } },
    update: { value: 'Cross-Compatible' },
    create: {
      skuId: 'IF13-14-1-DIS-OLED',
      label: 'Compatibility',
      value: 'Cross-Compatible',
    },
  });

  // Samsung S25 Ultra - Battery
  await prisma.inventory.upsert({
    where: { skuId: 'SGP25U-3-MOD-BAT' },
    update: { stockLevel: 180 },
    create: {
      skuId: 'SGP25U-3-MOD-BAT',
      variantId: s25Ultra.id,
      categoryId: catBattery.id,
      partName: 'Replacement Battery',
      qualityGrade: QualityGrade.Premium,
      wholesalePrice: 2200,
      stockLevel: 180,
    },
  });

  await prisma.specification.upsert({
    where: { skuId_label: { skuId: 'SGP25U-3-MOD-BAT', label: 'Type' } },
    update: { value: 'Lithium-Ion' },
    create: {
      skuId: 'SGP25U-3-MOD-BAT',
      label: 'Type',
      value: 'Lithium-Ion',
    },
  });

  await prisma.specification.upsert({
    where: { skuId_label: { skuId: 'SGP25U-3-MOD-BAT', label: 'Capacity' } },
    update: { value: '5000 mAh' },
    create: {
      skuId: 'SGP25U-3-MOD-BAT',
      label: 'Capacity',
      value: '5000 mAh',
    },
  });

  await prisma.specification.upsert({
    where: { skuId_label: { skuId: 'SGP25U-3-MOD-BAT', label: 'Fast Charging' } },
    update: { value: '45W' },
    create: {
      skuId: 'SGP25U-3-MOD-BAT',
      label: 'Fast Charging',
      value: '45W',
    },
  });

  // Samsung Galaxy Z Fold 6 - Battery
  await prisma.inventory.upsert({
    where: { skuId: 'SZF6-3-MOD-BAT' },
    update: { stockLevel: 60 },
    create: {
      skuId: 'SZF6-3-MOD-BAT',
      variantId: zFold6.id,
      categoryId: catBattery.id,
      partName: 'Replacement Battery',
      qualityGrade: QualityGrade.Premium,
      wholesalePrice: 2800,
      stockLevel: 60,
    },
  });

  await prisma.specification.upsert({
    where: { skuId_label: { skuId: 'SZF6-3-MOD-BAT', label: 'Type' } },
    update: { value: 'Lithium-Ion (Dual Cell)' },
    create: {
      skuId: 'SZF6-3-MOD-BAT',
      label: 'Type',
      value: 'Lithium-Ion (Dual Cell)',
    },
  });

  await prisma.specification.upsert({
    where: { skuId_label: { skuId: 'SZF6-3-MOD-BAT', label: 'Capacity' } },
    update: { value: '4400 mAh' },
    create: {
      skuId: 'SZF6-3-MOD-BAT',
      label: 'Capacity',
      value: '4400 mAh',
    },
  });

  await prisma.specification.upsert({
    where: { skuId_label: { skuId: 'SZF6-3-MOD-BAT', label: 'Fast Charging' } },
    update: { value: '25W' },
    create: {
      skuId: 'SZF6-3-MOD-BAT',
      label: 'Fast Charging',
      value: '25W',
    },
  });

  console.log('✅ Inventory parts and specifications created');

  // --- 10. CREATE CROSS-COMPATIBILITY MAPPINGS ---
  await prisma.compatibilityMap.upsert({
    where: { skuId_variantId: { skuId: 'IF13-14-1-DIS-OLED', variantId: ip13.id } },
    update: {},
    create: {
      skuId: 'IF13-14-1-DIS-OLED',
      variantId: ip13.id,
    },
  });

  await prisma.compatibilityMap.upsert({
    where: { skuId_variantId: { skuId: 'IF13-14-1-DIS-OLED', variantId: ip14.id } },
    update: {},
    create: {
      skuId: 'IF13-14-1-DIS-OLED',
      variantId: ip14.id,
    },
  });

  console.log('✅ Compatibility mappings created');

  console.log(`
╔════════════════════════════════════╗
║   🎉 Seeding Complete!             ║
║                                    ║
║   📊 Data Summary:                 ║
║   - Brands: 2                      ║
║   - Model Types: 3                 ║
║   - Generations: 9                 ║
║   - Variants: 9                    ║
║   - Categories: 4                  ║
║   - Inventory Parts: 7             ║
║   - Specifications: 24             ║
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
