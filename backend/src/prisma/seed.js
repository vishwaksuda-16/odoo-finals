const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const statusPool = ['DRAFT', 'NEW', 'PENDING', 'APPROVED', 'REJECTED'];

/** Seeded accounts (MANDATORY) */
const ACCOUNTS = {
  admin: {
    email: 'vishwaksuda@gmail.com',
    password: 'Admin@123',
    name: 'Vishwak ',
    role: 'ADMIN'
  },
  approver: {
    email: 'sudharshankrishnaalk@gmail.com',
    password: 'Sudha@123',
    name: 'Sudharshan Krishnaa',
    role: 'APPROVER'
  },
  engineer: {
    email: 'nowshathyasir61@gmail.com',
    password: 'Yasir@29',
    name: 'Yasir',
    role: 'ENGINEER'
  }
};

/** Random Indian users */
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

/** Product + BOM data */
const productNames = [
  'Mumbai Masala Kitchen Line','Delhi Gold Basmati Premium','Bengal Darjeeling Tea Select',
  'Chennai Filter Coffee Roast','Hyderabad Biryani Spice Kit','Punjab Amritsari Kulcha Mix',
  'Kerala Coconut Oil Pure','Goa Cashew Feni Blend','Jaipur Blue Pottery Glaze',
  'Kolkata Rosogolla Syrup Base','Ahmedabad Dhokla Steamer Pro','Lucknow Kebab Marinade',
  'Indore Poha Snack Line','Coorg Coffee Estate Reserve','Nashik Wine Grape Crush',
  'Surat Zari Thread Gold','Varanasi Silk Dye Pack','Shimla Apple Cider Base',
  'Madurai Jigarthanda Syrup','Udupi Sambar Powder Mill'
];

const componentCatalog = [
  'Steel rivet — Jindal','Copper busbar','Masala blend hopper','SS304 mixing blade',
  'Conveyor belt rubber','PLC sensor module','Motor 3PH 2HP','Food-grade seal gasket',
  'Tempered glass panel','Desiccant sachet','Label roll Hindi/English','Carton 5-ply export',
  'Tamper-evident cap','pH buffer sachet','RoHS compliant wire'
];

const ecoVerbs = [
  'Process calibration','Packaging revision','Costing update',
  'Supplier change','Quality sign-off','Shelf-life review'
];

function makeSku(name, idx) {
  const root = name.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 5);
  return `${root}${String(idx + 1).padStart(3, '0')}`;
}

function makeProductChange(currentSale, currentCost) {
  const saleDelta = rand(-3, 8);
  const costDelta = rand(-2, 5);
  return {
    salePrice: Math.max(10, currentSale + saleDelta),
    costPrice: Math.max(5, currentCost + costDelta),
    oldSalePrice: currentSale,
    oldCostPrice: currentCost
  };
}

function makeBomChange() {
  return {
    components: Array.from({ length: rand(3, 6) }).map(() => ({
      componentName: pick(componentCatalog),
      oldQuantity: rand(1, 5),
      quantity: rand(1, 8)
    }))
  };
}

async function main() {
  console.log('Seeding DB with Indian data + mandatory users...');

  await prisma.auditLog.deleteMany({});
  await prisma.passwordResetOtp.deleteMany().catch(() => {});
  await prisma.eCO.deleteMany({});
  await prisma.boMComponent.deleteMany({});
  await prisma.billOfMaterial.deleteMany({});
  await prisma.productVersion.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  /** Mandatory users */
  const adminUser = await prisma.user.create({
    data: {
      ...ACCOUNTS.admin,
      password: await bcrypt.hash(ACCOUNTS.admin.password, 10)
    }
  });

  const approverUser = await prisma.user.create({
    data: {
      ...ACCOUNTS.approver,
      password: await bcrypt.hash(ACCOUNTS.approver.password, 10)
    }
  });

  const engineerUser = await prisma.user.create({
    data: {
      ...ACCOUNTS.engineer,
      password: await bcrypt.hash(ACCOUNTS.engineer.password, 10)
    }
  });

  /** Random users */
  const extraUsers = [];
  const extraCount = rand(10, 20);

  for (let i = 0; i < extraCount; i++) {
    const u = generateIndianUser(i);
    const created = await prisma.user.create({
      data: {
        ...u,
        password: await bcrypt.hash(u.password, 10)
      }
    });
    extraUsers.push(created);
  }

  /** Role pools */
  const engineers = [
    engineerUser,
    ...extraUsers.filter(u => u.role === 'ENGINEER')
  ];

  const approvers = [
    approverUser,
    ...extraUsers.filter(u => u.role === 'APPROVER')
  ];

  /** Products + BOM */
  const createdProducts = [];

  for (let i = 0; i < productNames.length; i++) {
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

    for (let j = 0; j < rand(4, 7); j++) {
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
            : makeBomChange()
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