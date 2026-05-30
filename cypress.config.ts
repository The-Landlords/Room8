import { defineConfig } from "cypress";
import viteConfig from "./packages/react-frontend/vite.config";

export default defineConfig({
	projectId: "8d8m8g",
	allowCypressEnv: false,

	e2e: {
		supportFile: "cypress/support/e2e.ts",
		setupNodeEvents(on, config) {
			// implement node event listeners here
		}

	},

	component: {
		devServer: {
			framework: "react",
			bundler: "vite",
			viteConfig,
		},
	},
});
