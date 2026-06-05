import { defineConfig } from "cypress";
import createBundler from "@bahmutov/cypress-esbuild-preprocessor";
import { addCucumberPreprocessorPlugin } from "@badeball/cypress-cucumber-preprocessor";
import { createEsbuildPlugin } from "@badeball/cypress-cucumber-preprocessor/esbuild";
import viteConfig from "./packages/react-frontend/vite.config";

export default defineConfig({
	projectId: "8d8m8g",
	allowCypressEnv: true,

	e2e: {
		specPattern: "cypress/e2e/**/*.feature",
		supportFile: "cypress/support/e2e.ts",
		async setupNodeEvents(on, config) {
			await addCucumberPreprocessorPlugin(on, config);

			on(
				"file:preprocessor",
				createBundler({
					plugins: [createEsbuildPlugin(config)],
				})
			);

			return config;
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
