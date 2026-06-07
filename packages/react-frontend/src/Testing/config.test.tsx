// packages/react-frontend/src/Testing/config.test.ts
import { afterEach, expect, test, vi } from "vitest";

afterEach(() => {
	vi.unstubAllGlobals();
	vi.resetModules();
});

test("uses localhost API base on localhost", async () => {
	vi.resetModules();

	vi.stubGlobal("window", {
		location: {
			hostname: "localhost",
		},
	});

	const { API_BASE } = await import("../config");

	expect(API_BASE).toBe("http://localhost:8000");
});

test("uses localhost API base on 127.0.0.1", async () => {
	vi.resetModules();

	vi.stubGlobal("window", {
		location: {
			hostname: "127.0.0.1",
		},
	});

	const { API_BASE } = await import("../config");

	expect(API_BASE).toBe("http://localhost:8000");
});

test("uses production API base outside localhost", async () => {
	vi.resetModules();

	vi.stubGlobal("window", {
		location: {
			hostname: "room8.example.com",
		},
	});

	const { API_BASE } = await import("../config");

	expect(API_BASE).toBe(
		"https://room8-bqgagjd0cndffae5.canadacentral-01.azurewebsites.net"
	);
});
