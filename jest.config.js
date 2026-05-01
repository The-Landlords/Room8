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
	],
};
