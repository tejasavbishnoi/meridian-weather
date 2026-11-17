import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Serves /api/ai while developing, like Vercel does after deploy
function localApi() {
  return {
    name: "local-api",
    configureServer(server) {
      Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), ""));

      server.middlewares.use("/api/ai", async (req, res) => {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString();
        try {
          req.body = raw ? JSON.parse(raw) : {};
        } catch {
          req.body = {};
        }

        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
        res.json = (data) => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(data));
        };

        try {
          const mod = await server.ssrLoadModule("/api/ai.js");
          await mod.default(req, res);
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: "Local API error." });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localApi()],
});