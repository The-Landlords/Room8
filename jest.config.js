module.exports = {
	projects: [
		{
			displayName: "backend",
			testEnvironment: "node",
			testMatch: ["<rootDir>/packages/express_backend/**/*.test.ts"],
			transform: {
				"^.+\\.(ts|tsx)$": [
					"ts-jest",
					{
						tsconfig:
							"<rootDir>/packages/express_backend/tsconfig.jest.json",
					},
				],
			},
			moduleNameMapper: {
				"^(\\.{1,2}/.*)\\.js$": "$1",
			},
		},
		{
			displayName: "frontend",
			testEnvironment: "jsdom",
			testMatch: ["<rootDir>/packages/react-frontend/src/**/*.test.tsx"],
			setupFiles: ["<rootDir>/jest.setup.js"],
			moduleNameMapper: {
				"^../config$":
					"<rootDir>/packages/react-frontend/src/config.jest.ts",
				"^../../config$":
					"<rootDir>/packages/react-frontend/src/config.jest.ts",
				"^src/config$":
					"<rootDir>/packages/react-frontend/src/config.jest.ts",
			},
			transform: {
				"^.+\\.(ts|tsx)$": [
					"ts-jest",
					{
						tsconfig:
							"<rootDir>/packages/react-frontend/tsconfig.jest.json",
					},
				],
			},
		},
	],
};
