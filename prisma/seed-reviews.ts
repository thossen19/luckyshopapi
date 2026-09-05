import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const firstNames = ["Sofia", "Marcus", "Aisha", "Liam", "Noah", "Emily", "Grace", "Leo", "Mia", "Zara", "Ethan", "Nina"];
const lastNames = ["Chen", "Rivera", "Khan", "O'Neil", "Patel", "Davis", "Ng", "Lee", "Martinez", "Ali", "Brooks", "Tan"];

const threeStarTitles = [
  "Good value, solid quality",
  "Does the job well",
  "Decent product overall",
  "Pretty good for the price",
  "Happy with this purchase",
  "Nice, would recommend",
];

const twoStarTitles = [
  "Average, expected more",
  "A bit underwhelming",
  "Okay but not great",
  "Mediocre at best",
  "Could be better",
  "Not quite what I hoped",
];

const threeStarComments = [
  "Works as expected and the quality is decent. Probably worth the money.",
  "Good product for daily use. Packaging arrived in great condition.",
  "Solid overall. Does what it says and I have no major complaints.",
  "Decent quality and reasonable shipping time. Happy enough with it.",
];

const twoStarComments = [
  "It's okay but I felt the build quality could be better than this.",
  "Average experience. The product met expectations but only barely.",
  "A little disappointed, though it does function as described.",
  "Mediocre. It works, but I wouldn't buy it again at full price.",
];

/**
 * Seeds APPROVED demo product reviews (2 & 3 star) across all products.
 * Re-seeds cleanly for the demo store: clears any existing reviews/customers first.
 */
async function main() {
  console.log("Seeding demo product reviews (2/3 star)...");

  const stores = await prisma.store.findMany({ select: { id: true } });
  if (stores.length === 0) {
    throw new Error("No store found. Run the main seed first.");
  }
  const storeId = stores[0].id;

  const seedCustomers = await prisma.customer.findMany({
    where: { storeId, email: { contains: ".demo-review@" } },
    select: { id: true },
  });
  const seedCustomerIds = seedCustomers.map((c) => c.id);
  await prisma.review.deleteMany({ where: { storeId, customerId: { in: seedCustomerIds } } });
  await prisma.customer.deleteMany({ where: { storeId, email: { contains: ".demo-review@" } } });
  console.log("Cleared previous review-seed data");

  const customers: { id: string; firstName: string; lastName: string }[] = [];
  for (let i = 0; i < firstNames.length; i++) {
    const created = await prisma.customer.create({
      data: {
        email: `${firstNames[i].toLowerCase()}.demo-review@example.com`,
        firstName: firstNames[i],
        lastName: lastNames[i],
        storeId,
        isActive: true,
      },
    });
    customers.push(created);
  }
  console.log(`Created ${customers.length} demo customers`);

  const products = await prisma.product.findMany({
    where: { storeId },
    select: { id: true },
  });
  console.log(`Found ${products.length} products`);

  let created = 0;

  for (let p = 0; p < products.length; p++) {
    const reviewCount = 2 + (p % 3); // 2, 3, or 4 reviews per product
    for (let i = 0; i < reviewCount; i++) {
      const rating = i % 2 === 0 ? 3 : 2; // alternate 3 and 2 star
      const customer = customers[(p + i) % customers.length];
      const title = (rating === 3 ? threeStarTitles : twoStarTitles)[(p + i) % 6];
      const comment = (rating === 3 ? threeStarComments : twoStarComments)[(p + i) % 4];

      await prisma.review.create({
        data: {
          customerId: customer.id,
          productId: products[p].id,
          storeId,
          rating,
          title,
          comment,
          status: "APPROVED",
          isFeatured: false,
          helpful: 0,
          createdAt: new Date(Date.now() - i * 86400000),
        },
      });
      created++;
    }
  }

  console.log(`Created ${created} reviews across ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
