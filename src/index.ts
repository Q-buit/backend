import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "0.0.0.0";

async function bootstrap() {
  const app = createApp();
  await app.listen({ port, host });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
