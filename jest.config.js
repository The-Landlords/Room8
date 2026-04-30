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
		},
		{
			displayName: "frontend",
			testEnvironment: "jsdom",
			testMatch: ["<rootDir>/packages/react-frontend/src/**/*.test.tsx"],
			transform: {
				"^.+\\.(ts|tsx)$": [
					"ts-jest",
					{
						tsconfig:
							"<rootDir>/packages/react-frontend/tsconfig.jest.json",
					},
				],
			},
			moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
			setupFilesAfterEnv: [
				"<rootDir>/packages/react-frontend/src/jest.setup.ts",
			],
		},
	],
};
