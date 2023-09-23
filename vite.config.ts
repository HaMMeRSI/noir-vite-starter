import { defineConfig } from "vite";

const wasmContentTypePlugin = {
	name: "wasm-content-type-plugin",
	configureServer(server) {
		server.middlewares.use((req, res, next) => {
			if (req.url.endsWith(".wasm")) {
				res.setHeader("Content-Type", "application/wasm");
			}
			next();
		});
	},
};

export default defineConfig({
	plugins: [wasmContentTypePlugin],
});
