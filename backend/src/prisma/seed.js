const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const statusPool = ['DRAFT', 'NEW', 'PENDING', 'APPROVED', 'REJECTED'];

/** Mandatory Users */
const ACCOUNTS = {
  admin: {
    email: 'vishwaksuda@gmail.com',
    password: 'Admin@123',
    name: 'Vishwak',
    role: 'ADMIN'
  },
  approver: {
    email: 'sudharshankrishnaalk@gmail.com',
    password: 'Sudha@123',
    name: 'Sudharshan Krishna',
    role: 'APPROVER'
  },
  engineer: {
    email: 'nowshathyasir61@gmail.com',
    password: 'Yasir@29',
    name: 'Yasir',
    role: 'ENGINEER'
  }
};

/** Indian Users */
const indianFirstNames = [
  'Aarav','Vivaan','Aditya','Arjun','Reyansh','Sai','Krishna','Rohan','Karthik','Rahul',
  'Ananya','Diya','Priya','Sneha','Aishwarya','Pooja','Neha','Kavya','Meera','Ishita'
];

const indianLastNames = [
  'Sharma','Verma','Iyer','Reddy','Nair','Patel','Gupta','Khan','Ali','Das',
  'Chatterjee','Pillai','Yadav','Singh','Joshi'
];

function generateIndianUser(index) {
  const first = pick(indianFirstNames);
  const last = pick(indianLastNames);
  return {
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${index}@gmail.com`,
    password: 'User@123',
    role: Math.random() > 0.7 ? 'APPROVER' : 'ENGINEER'
  };
}

/** Products with category */
const products = [
  { name: 'Wooden Office Chair', category: 'FURNITURE' },
  { name: 'Ergonomic Mesh Chair', category: 'FURNITURE' },
  { name: 'Dining Table 6 Seater', category: 'FURNITURE' },

  { name: 'LED Smart TV 42 inch', category: 'ELECTRONICS' },
  { name: 'LED Smart TV 55 inch', category: 'ELECTRONICS' },
  { name: 'Bluetooth Speaker', category: 'ELECTRONICS' },

  { name: 'Washing Machine', category: 'APPLIANCE' },
  { name: 'Refrigerator', category: 'APPLIANCE' },
  { name: 'Air Conditioner', category: 'APPLIANCE' }
];

/** Category-based components */
const componentMap = {
  FURNITURE: [
    'Wood plank',
    'Nails',
    'Screws',
    'Foam cushion',
    'Fabric cover',
    'Metal frame'
  ],
  ELECTRONICS: [
    'Circuit board PCB',
    'LED display panel',
    'Copper wiring',
    'Speaker driver',
    'Battery',
    'Power supply'
  ],
  APPLIANCE: [
    'Motor',
    'Compressor',
    'Copper tubing',
    'Control panel',
    'Drum unit',
    'Cooling coil'
  ]
};

const ecoVerbs = [
  'Design update',
  'Component replacement',
  'Cost optimization',
  'Supplier change',
  'Performance improvement',
  'Quality enhancement'
];

function makeSku(name, idx) {
  const root = name.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 5);
  return `${root}${String(idx + 1).padStart(3, '0')}`;
}

function makeProductChange(currentSale, currentCost) {
  return {
    salePrice: Math.max(10, currentSale + rand(-3, 8)),
    costPrice: Math.max(5, currentCost + rand(-2, 5)),
    oldSalePrice: currentSale,
    oldCostPrice: currentCost
  };
}

function makeBomChange(category) {
  return {
    components: Array.from({ length: rand(3, 6) }).map(() => ({
      componentName: pick(componentMap[category]),
      oldQuantity: rand(1, 5),
      quantity: rand(1, 8)
    }))
  };
}

async function main() {
  console.log('Seeding DB with REALISTIC data...');

  await prisma.auditLog.deleteMany({});
  await prisma.passwordResetOtp.deleteMany().catch(() => {});
  await prisma.ecoApprovalRule.deleteMany({});
  await prisma.ecoStage.deleteMany({});
  await prisma.eCO.deleteMany({});
  await prisma.boMComponent.deleteMany({});
  await prisma.billOfMaterial.deleteMany({});
  await prisma.productVersion.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  /** Mandatory users */
  const adminUser = await prisma.user.create({
    data: { ...ACCOUNTS.admin, password: await bcrypt.hash(ACCOUNTS.admin.password, 10) }
  });

  const approverUser = await prisma.user.create({
    data: { ...ACCOUNTS.approver, password: await bcrypt.hash(ACCOUNTS.approver.password, 10) }
  });

  const engineerUser = await prisma.user.create({
    data: { ...ACCOUNTS.engineer, password: await bcrypt.hash(ACCOUNTS.engineer.password, 10) }
  });

  /** Random users */
  const extraUsers = [];
  for (let i = 0; i < rand(10, 20); i++) {
    const u = generateIndianUser(i);
    const user = await prisma.user.create({
      data: { ...u, password: await bcrypt.hash(u.password, 10) }
    });
    extraUsers.push(user);
  }

  const engineers = [engineerUser, ...extraUsers.filter(u => u.role === 'ENGINEER')];
  const approvers = [approverUser, ...extraUsers.filter(u => u.role === 'APPROVER')];

  /** ECO workflow stages + default approval rule on Approval stage */
  await prisma.ecoStage.create({
    data: { name: 'New', sortOrder: 1, pipelineKind: 'NEW' },
  });
  const stageApproval = await prisma.ecoStage.create({
    data: { name: 'Approval', sortOrder: 2, pipelineKind: 'PENDING' },
  });
  await prisma.ecoStage.create({
    data: { name: 'Done', sortOrder: 3, pipelineKind: 'TERMINAL' },
  });
  await prisma.ecoApprovalRule.create({
    data: {
      stageId: stageApproval.id,
      userId: approverUser.id,
      kind: 'Required',
    },
  });

  /** Products */
  const createdProducts = [];

  for (let i = 0; i < products.length; i++) {
    const { name, category } = products[i];

    const baseCost = rand(1000, 20000);
    const baseSale = baseCost + rand(500, 5000);

    const product = await prisma.product.create({
      data: {
        sku: makeSku(name, i),
        name
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

    for (let j = 0; j < rand(4, 7); j++) {
      await prisma.boMComponent.create({
        data: {
          bomId: bom.id,
          componentName: pick(componentMap[category]),
          quantity: rand(1, 10)
        }
      });
    }

    createdProducts.push({ ...product, baseCost, baseSale, category });
  }

  /** ECOs */
  for (let i = 0; i < rand(55, 65); i++) {
    const product = pick(createdProducts);
    const creator = pick(engineers);
    const approver = pick(approvers);
    const status = pick(statusPool);
    const type = Math.random() > 0.35 ? 'PRODUCT' : 'BOM';

    const eco = await prisma.eCO.create({
      data: {
        title: `${pick(ecoVerbs)} — ${product.name} — #${i + 1}`,
        type,
        status,
        productId: product.id,
        createdById: creator.id,
        proposedChanges:
          type === 'PRODUCT'
            ? makeProductChange(product.baseSale, product.baseCost)
            : makeBomChange(product.category)
      }
    });

    await prisma.auditLog.create({
      data: {
        action: `ECO_${status}`,
        targetId: eco.id,
        newValue: JSON.stringify({ status }),
        userId: status === 'APPROVED' ? approver.id : creator.id
      }
    });
  }

  console.log('Seed Completed');
  console.log('Users:', await prisma.user.count());
  console.log('Products:', await prisma.product.count());
  console.log('ECOs:', await prisma.eCO.count());

  console.log('\nLogin Credentials:');
  console.log('Admin:', ACCOUNTS.admin.email, '/', ACCOUNTS.admin.password);
  console.log('Approver:', ACCOUNTS.approver.email, '/', ACCOUNTS.approver.password);
  console.log('Engineer:', ACCOUNTS.engineer.email, '/', ACCOUNTS.engineer.password);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });