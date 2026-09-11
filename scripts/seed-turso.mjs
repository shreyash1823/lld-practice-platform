import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
}

const client = createClient({
  url,
  authToken,
});

const problems = [
  {
    id: "prob_parking",
    slug: "parking-lot",
    title: "Parking Lot",
    difficulty: "Beginner",
    prompt:
      "Design an object-oriented parking lot that can park different vehicle types across multiple floors, issue tickets, and compute fees on exit.",
    requirements: [
      "Support motorcycle, car, and bus with different spot sizes.",
      "Multiple floors; a vehicle parks in the first available suitable spot.",
      "Issue a ticket on entry and compute a fee on exit based on duration.",
      "Prevent double-booking a spot.",
    ],
    constraints: [
      "Do not assume a database; in-memory structures are fine.",
      "Fee policy may change later (hourly vs flat vs peak hours).",
    ],
    guidingQuestions: [
      "Who owns the mapping from ticket to parked vehicle?",
      "Where should spot-finding strategy live so it can change?",
      "How do you keep a spot from being assigned twice?",
    ],
  },
  {
    id: "prob_elevator",
    slug: "elevator-system",
    title: "Elevator System",
    difficulty: "Intermediate",
    prompt:
      "Design a multi-elevator controller for a building. Users request an elevator from a floor; cars move, open doors, and serve destination floors without starving requests.",
    requirements: [
      "Multiple elevator cars in one building.",
      "Hall calls (up/down) and car destination buttons.",
      "A dispatcher assigns a car to a hall call.",
      "Doors open/close; a car cannot move with doors open.",
    ],
    constraints: [
      "You do not need a real-time clock library; model time as discrete steps if useful.",
      "Dispatcher strategy should be replaceable (nearest vs SCAN).",
    ],
    guidingQuestions: [
      "What is the state machine of a single elevator car?",
      "Who decides which car takes a hall call?",
      "How are pending destinations stored and ordered?",
    ],
  },
  {
    id: "prob_vending",
    slug: "vending-machine",
    title: "Vending Machine",
    difficulty: "Beginner",
    prompt:
      "Design a vending machine that holds inventory, accepts payment, dispenses a product, and returns change. Invalid sequences (select before pay, sold-out item) must be rejected cleanly.",
    requirements: [
      "Inventory of products with price and quantity.",
      "Accept coins/cash (or a payment port) and return change.",
      "Dispense only after successful payment.",
      "Sold-out and insufficient-funds paths are first-class.",
    ],
    constraints: [
      "Payment method may later include card; do not hard-code coin math into the machine coordinator.",
      "One transaction at a time.",
    ],
    guidingQuestions: [
      "Which states belong to the machine vs the current transaction?",
      "What interface lets you swap cash for card later?",
      "Who decrements inventory, and when?",
    ],
  },
  {
    id: "prob_library",
    slug: "library-management",
    title: "Library Management",
    difficulty: "Intermediate",
    prompt:
      "Design a library that catalogs books, registers members, lends copies, and handles returns, due dates, and a simple fine policy.",
    requirements: [
      "Books have one catalog record and many physical copies.",
      "Members can borrow up to a configurable limit.",
      "Lending records due dates; overdue returns accrue fines.",
      "Search by title or ISBN.",
    ],
    constraints: [
      "Fine policy and borrow limit will change.",
      "Do not model a full payment gateway; recording the fine is enough.",
    ],
    guidingQuestions: [
      "What is the difference between Book and Copy in your model?",
      "Where does the borrow limit get enforced?",
      "How would adding reservations change the design?",
    ],
  },
  {
    id: "prob_lru",
    slug: "lru-cache",
    title: "In-Memory Cache (LRU)",
    difficulty: "Advanced",
    prompt:
      "Design an in-memory cache with get/put, a maximum capacity, and LRU eviction. Discuss how you would reason about concurrent access even if you do not implement threads.",
    requirements: [
      "O(1) get and put under the usual linked-hash-map approach (explain the structure).",
      "Evict the least recently used entry when at capacity.",
      "get refreshes recency; put of an existing key updates value and recency.",
      "Capacity is configurable at construction.",
    ],
    constraints: [
      "Single-process memory; no Redis.",
      "Thread-safety can be a design discussion rather than working locks.",
    ],
    guidingQuestions: [
      "Which two structures give you O(1) lookup and eviction?",
      "Who owns the eviction policy if you later add LFU?",
      "What goes wrong under concurrent get/put without a lock story?",
    ],
  },
];

for (const problem of problems) {
  await client.execute({
    sql: `
      INSERT INTO Problem
      (id, slug, title, difficulty, prompt, requirementsJson, constraintsJson, questionsJson)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET
        title = excluded.title,
        difficulty = excluded.difficulty,
        prompt = excluded.prompt,
        requirementsJson = excluded.requirementsJson,
        constraintsJson = excluded.constraintsJson,
        questionsJson = excluded.questionsJson
    `,
    args: [
      problem.id,
      problem.slug,
      problem.title,
      problem.difficulty,
      problem.prompt,
      JSON.stringify(problem.requirements),
      JSON.stringify(problem.constraints),
      JSON.stringify(problem.guidingQuestions),
    ],
  });

  console.log(`Seeded: ${problem.title}`);
}

console.log("✅ Turso database seeded successfully!");

client.close();
