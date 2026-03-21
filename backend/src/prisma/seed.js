const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const statusPool = ['DRAFT', 'NEW', 'PENDING', 'APPROVED', 'REJECTED'];

const productNames = [
  "Pearly Shimmer", "Candlelight", "Stardust", "Shego Slaps", "Aurora Blend",
  "Mint Burst", "Velvet Rose", "Nexa Glow", "Coral Mist", "Sunflare",
  "Aqua Silk", "Ruby Dust", "Opal Dew", "Twilight Matte", "Frost Beam",
  "Gold Veil", "Wild Berry", "Carbon Noir", "Lime Lift", "Honey Bloom"
];

const componentCatalog = [
  "Pigment A", "Pigment B", "Base Solvent", "Stabilizer", "Wax Blend",
  "Activator", "Binder", "Fragrance", "Cooling Agent", "Preservative",
  "Color Booster", "Shimmer Powder", "pH Regulator", "Anti-Fade Agent"
];

function makeSku(name, idx) {
  const root = name.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 5);
  return `${root}${String(idx + 1).padStart(3, '0')}`;
}

function makeProductChange(currentSale, currentCost) {
  const saleDelta = rand(-3, 8);
  const costDelta = rand(-2, 5);
  const newSale = Math.max(10, currentSale + saleDelta);
  const newCost = Math.max(5, currentCost + costDelta);
  return {
    salePrice: newSale,
    costPrice: newCost,
    oldSalePrice: currentSale,
    oldCostPrice: currentCost
  };
}

function makeBomChange() {
  const size = rand(3, 6);
  return {
    components: Array.from({ length: size }).map(() => ({
      componentName: pick(componentCatalog),
      oldQuantity: rand(1, 5),
      quantity: rand(1, 8)
    }))
  };
}

async function main() {
  console.log('Seeding realistic PLM dataset...');

  await prisma.auditLog.deleteMany({});
  await prisma.eCO.deleteMany({});
  await prisma.boMComponent.deleteMany({});
  await prisma.billOfMaterial.deleteMany({});
  await prisma.productVersion.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultPassword = await bcrypt.hash('Admin@123', 10);

  const usersPayload = [
    { email: 'admin@gmail.com', name: 'System Administrator', role: 'ADMIN' },
    { email: 'approver1@gmail.com', name: 'Olivia Quality', role: 'APPROVER' },
    { email: 'approver2@gmail.com', name: 'Liam Process', role: 'APPROVER' },
    { email: 'approver3@gmail.com', name: 'Noah Compliance', role: 'APPROVER' },
    { email: 'approver4@gmail.com', name: 'Emma Validation', role: 'APPROVER' },
    ...Array.from({ length: 12 }).map((_, i) => ({
      email: `engineer${i + 1}@gmail.com`,
      name: `Engineer ${i + 1}`,
      role: 'ENGINEER'
    }))
  ];

  const createdUsers = [];
  for (const payload of usersPayload) {
    const user = await prisma.user.create({
      data: { ...payload, password: defaultPassword }
    });
    createdUsers.push(user);
  }

  const engineers = createdUsers.filter((u) => u.role === 'ENGINEER');
  const approvers = createdUsers.filter((u) => u.role === 'APPROVER');

  const createdProducts = [];
  for (let i = 0; i < productNames.length; i += 1) {
    const baseCost = rand(12, 35);
    const baseSale = baseCost + rand(8, 20);
    const product = await prisma.product.create({
      data: {
        sku: makeSku(productNames[i], i),
        name: productNames[i]
      }
    });

    await prisma.productVersion.create({
      data: {
        productId: product.id,
        versionNumber: 1,
        salePrice: baseSale,
        costPrice: baseCost,
        status: 'ACTIVE'
      }
    });

    const bom = await prisma.billOfMaterial.create({
      data: {
        productId: product.id,
        versionNumber: 1,
        status: 'ACTIVE'
      }
    });

    for (let c = 0; c < rand(4, 7); c += 1) {
      await prisma.boMComponent.create({
        data: {
          bomId: bom.id,
          componentName: pick(componentCatalog),
          quantity: rand(1, 8)
        }
      });
    }

    createdProducts.push({ ...product, baseCost, baseSale });
  }

  const ecoTarget = rand(55, 70);
  for (let i = 0; i < ecoTarget; i += 1) {
    const product = pick(createdProducts);
    const creator = pick(engineers);
    const status = pick(statusPool);
    const type = Math.random() > 0.35 ? 'PRODUCT' : 'BOM';
    const approver = pick(approvers);
    const titlePrefix = type === 'PRODUCT' ? 'Formula Change' : 'BoM Revision';

    const eco = await prisma.eCO.create({
      data: {
        title: `${titlePrefix} - ${product.name} #${i + 1}`,
        type,
        status,
        productId: product.id,
        createdById: creator.id,
        proposedChanges: type === 'PRODUCT'
          ? makeProductChange(product.baseSale, product.baseCost)
          : makeBomChange()
      }
    });

    if (status === 'APPROVED') {
      await prisma.auditLog.create({
        data: {
          action: 'PRODUCT_VERSION_BUMP',
          targetId: product.id,
          oldValue: JSON.stringify({ salePrice: product.baseSale, costPrice: product.baseCost }),
          newValue: JSON.stringify(eco.proposedChanges),
          userId: approver.id
        }
      });
    } else if (status === 'REJECTED') {
      await prisma.auditLog.create({
        data: {
          action: 'ECO_REJECTED',
          targetId: eco.id,
          oldValue: JSON.stringify({ status: 'PENDING' }),
          newValue: JSON.stringify({ status: 'REJECTED' }),
          userId: approver.id
        }
      });
    } else if (status === 'PENDING' || status === 'NEW') {
      await prisma.auditLog.create({
        data: {
          action: 'ECO_SUBMITTED',
          targetId: eco.id,
          oldValue: null,
          newValue: JSON.stringify({ status }),
          userId: creator.id
        }
      });
    }
  }

  const userCount = await prisma.user.count();
  const productCount = await prisma.product.count();
  const ecoCount = await prisma.eCO.count();
  const auditCount = await prisma.auditLog.count();

  console.log('Seed completed successfully.');
  console.log(`Users: ${userCount}`);
  console.log(`Products: ${productCount}`);
  console.log(`ECOs: ${ecoCount}`);
  console.log(`Audit Logs: ${auditCount}`);
  console.log('Admin login -> admin@gmail.com / Admin@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });