import { seedAll } from "./seed-core";

async function main() {
  await seedAll();
}

main().catch((error: unknown) => {
  console.error("Seed run failed.");
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});
