import { seedPatients } from "./seed-core";

async function main() {
  await seedPatients();
}

main().catch((error: unknown) => {
  console.error("Patient seed run failed.");
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});
