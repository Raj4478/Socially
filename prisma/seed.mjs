// Demo content for local development: `npm run db:seed`.
// Seeded accounts have fake Clerk ids, so nobody can sign in as them.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const users = [
  { username: "aisha", name: "Aisha Khan", bio: "Product designer. Coffee, type and #design systems.", location: "Bengaluru" },
  { username: "rohan", name: "Rohan Mehta", bio: "Full-stack dev. Shipping with #nextjs and #postgres.", location: "Pune", website: "https://example.com" },
  { username: "meera", name: "Meera Iyer", bio: "Weekend trekker. Weekday data engineer.", location: "Chennai" },
  { username: "dev", name: "Dev Patel", bio: "Learning in public. #100DaysOfCode", location: "Ahmedabad" },
];

const posts = [
  ["rohan", "Just moved our feed to cursor pagination. Page loads dropped from 1.8s to 220ms. #nextjs #postgres"],
  ["aisha", "Hot take: most dashboards need fewer colours, not more. One accent, lots of neutrals. #design"],
  ["meera", "Sunrise at Kudremukh this morning. Worth every step of the 4am start. #travel"],
  ["dev", "Day 37 of #100DaysOfCode: finally understood React server actions. Thanks @rohan for the walkthrough!"],
  ["rohan", "Reminder: validate on the server even if the form already does. Clients lie. #webdev"],
  ["aisha", "Shipping a new icon set this week. Which do you prefer, rounded or sharp corners? #design"],
  ["meera", "Anyone else using #postgres generated columns for search? Curious about trade-offs."],
  ["dev", "Monsoon coding playlist recommendations? Need something for long debugging sessions. #भारत"],
];

async function main() {
  const force = process.argv.includes("--force");
  if ((await prisma.post.count()) > 0 && !force) {
    console.log("Database already has posts. Run with --force to wipe demo data and reseed.");
    return;
  }
  if (force) await prisma.user.deleteMany({ where: { clerkId: { startsWith: "seed_" } } });

  const created = {};
  for (const u of users) {
    created[u.username] = await prisma.user.create({
      data: { ...u, clerkId: `seed_${u.username}`, email: `${u.username}@example.com` },
    });
  }

  const now = Date.now();
  const at = (i) => new Date(now - (i + 1) * 47 * 60 * 1000);
  const postRows = [];
  for (const [i, [author, content]] of posts.entries()) {
    postRows.push(
      await prisma.post.create({
        data: { authorId: created[author].id, content, createdAt: at(i), updatedAt: at(i) },
      })
    );
  }

  // Some follows, likes and replies so counts and notifications look real.
  const pairs = [["dev", "rohan"], ["dev", "aisha"], ["aisha", "rohan"], ["meera", "aisha"], ["rohan", "meera"]];
  for (const [a, b] of pairs) {
    await prisma.follows.create({ data: { followerId: created[a].id, followingId: created[b].id } });
  }
  for (const [i, post] of postRows.entries()) {
    const likers = users.filter((u) => created[u.username].id !== post.authorId).slice(0, (i % 3) + 1);
    for (const l of likers) await prisma.like.create({ data: { postId: post.id, userId: created[l.username].id } });
  }
  await prisma.comment.create({ data: { postId: postRows[0].id, authorId: created.dev.id, content: "Would love a write-up on this!" } });
  await prisma.comment.create({ data: { postId: postRows[0].id, authorId: created.aisha.id, content: "Huge improvement 👏" } });
  await prisma.comment.create({ data: { postId: postRows[1].id, authorId: created.meera.id, content: "Agree. Colour should mean something." } });

  console.log(`Seeded ${users.length} users and ${posts.length} posts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
