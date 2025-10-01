import { createServer } from "./server.js";

import { env } from "../config/env.js";

const server = createServer();

server.listen(env.PORT, () => {
  console.log(`api running on ${env.PORT}`);
});
