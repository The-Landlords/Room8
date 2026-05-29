import { defineConfig } from "cypress";
import viteConfig from "./packages/react-frontend/vite.config";

export default defineConfig({
	projectId: "8d8m8g",
	allowCypressEnv: false,

	e2e: {
		setupNodeEvents(on, config) {
			// implement node event listeners here
		},
	},

	component: {
		devServer: {
			framework: "react",
			bundler: "vite",
			viteConfig,
		},
	},
});
