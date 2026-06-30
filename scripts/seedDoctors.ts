import { seedDoctors } from "./seed-core";

async function main() {
  await seedDoctors();
}

main().catch((error: unknown) => {
  console.error("Physician seed run failed.");
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});
