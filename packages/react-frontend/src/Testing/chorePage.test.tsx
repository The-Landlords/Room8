import * as React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import ChorePage from "../pages/chorePage";
import { API_BASE } from "../config";

type Chore = {
	_id: string;
	title: string;
	homeId?: string;
	assignedTo?: string;
};

function renderChorePageWithHistory() {
	return render(
		<MemoryRouter
			initialEntries={[
				"/home/testuser/testhome",
				"/testuser/testhome/chores",
			]}
			initialIndex={1}
		>
			<Routes>
				<Route
					path="/home/:username/:homeCode"
					element={<div>Home Page</div>}
				/>
				<Route
					path="/:username/:homeCode/chores"
					element={<ChorePage />}
				/>
			</Routes>
		</MemoryRouter>
	);
}

function jsonResponse(data: unknown) {
	return {
		ok: true,
		json: async () => data,
	} as Response;
}

function mockChoreFetch({
	chores = [],
	createdChore = {
		_id: "chore-1",
		title: "Wash dishes",
		homeId: "home-1",
	},
}: {
	chores?: Chore[];
	createdChore?: Chore;
} = {}) {
	globalThis.fetch = vi.fn(async (input, init) => {
		const url = String(input);
		const method = init?.method ?? "GET";

		// Used by Header.
		if (url === `${API_BASE}/homes/code/testhome` && method === "GET") {
			return jsonResponse({
				_id: "home-1",
				homeName: "Test Home",
			});
		}

		// Used by ChorePage initial load.
		if (url === `${API_BASE}/testhome/chores` && method === "GET") {
			return jsonResponse(chores);
		}

		// Used by ChorePage add.
		if (url === `${API_BASE}/testhome/chores` && method === "POST") {
			return jsonResponse(createdChore);
		}

		// Used by ChorePage remove.
		if (
			url === `${API_BASE}/testhome/chores/chore-1` &&
			method === "DELETE"
		) {
			return jsonResponse({});
		}

		throw new Error(`Unhandled fetch: ${method} ${url}`);
	}) as unknown as typeof fetch;
}

function getTrashButton() {
	const trashButton = screen
		.getAllByRole("button")
		.find((button) => button.querySelector("svg[data-icon='trash-can']"));

	expect(trashButton).toBeDefined();

	return trashButton as HTMLButtonElement;
}

beforeEach(() => {
	mockChoreFetch();
});

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

test("fetches and displays chores", async () => {
	mockChoreFetch({
		chores: [
			{
				_id: "chore-1",
				title: "Take out trash",
				homeId: "home-1",
			},
		],
	});

	renderChorePageWithHistory();

	expect(await screen.findByText("Take out trash")).toBeInTheDocument();

	expect(globalThis.fetch).toHaveBeenCalledWith(
		`${API_BASE}/testhome/chores`,
		{
			credentials: "include",
		}
	);
});

test("displays the empty chore state on the real page", async () => {
	mockChoreFetch({
		chores: [],
	});

	renderChorePageWithHistory();

	expect(await screen.findByText("No Chores")).toBeInTheDocument();
});

test("renders the real add chore button", async () => {
	mockChoreFetch({
		chores: [],
	});

	renderChorePageWithHistory();

	await screen.findByText("No Chores");

	expect(screen.getByRole("button", { name: "+" })).toBeInTheDocument();
});

test("clicking the add button opens the add overlay", async () => {
	mockChoreFetch({
		chores: [],
	});

	renderChorePageWithHistory();

	await screen.findByText("No Chores");

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "+" }));

	expect(
		screen.getByRole("heading", { name: "Add Chore" })
	).toBeInTheDocument();

	expect(screen.getByPlaceholderText("enter text")).toBeInTheDocument();

	expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
});

test("clicking the back button sends you to the previous page", async () => {
	mockChoreFetch({
		chores: [],
	});

	renderChorePageWithHistory();

	await screen.findByText("No Chores");

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: /back/i }));

	expect(screen.getByText("Home Page")).toBeInTheDocument();
});

test("submitting a new chore sends a POST request and displays the new chore", async () => {
	mockChoreFetch({
		chores: [],
		createdChore: {
			_id: "chore-1",
			title: "Wash dishes",
			homeId: "home-1",
		},
	});

	renderChorePageWithHistory();

	await screen.findByText("No Chores");

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "+" }));
	await user.type(screen.getByPlaceholderText("enter text"), "Wash dishes");
	await user.click(screen.getByRole("button", { name: "Submit" }));

	await waitFor(() => {
		expect(globalThis.fetch).toHaveBeenCalledWith(
			`${API_BASE}/testhome/chores`,
			expect.objectContaining({
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: "Wash dishes",
				}),
			})
		);
	});

	expect(await screen.findByText("Wash dishes")).toBeInTheDocument();
});

test("clicking remove sends a DELETE request and removes the chore from the page", async () => {
	mockChoreFetch({
		chores: [
			{
				_id: "chore-1",
				title: "Take out trash",
				homeId: "home-1",
			},
		],
	});

	renderChorePageWithHistory();

	expect(await screen.findByText("Take out trash")).toBeInTheDocument();

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "-" }));
	await user.click(getTrashButton());

	await waitFor(() => {
		expect(globalThis.fetch).toHaveBeenCalledWith(
			`${API_BASE}/testhome/chores/chore-1`,
			{
				method: "DELETE",
				credentials: "include",
			}
		);
	});

	await waitFor(() => {
		expect(screen.queryByText("Take out trash")).not.toBeInTheDocument();
	});
});

test("displays assigned chore text", async () => {
	mockChoreFetch({
		chores: [
			{
				_id: "chore-1",
				title: "Sweep",
				assignedTo: "Alex",
			},
		],
	});

	renderChorePageWithHistory();

	expect(await screen.findByText("Sweep (Alex)")).toBeInTheDocument();
});

test("shows empty chores when chore fetch fails", async () => {
	const consoleErrorSpy = vi
		.spyOn(console, "error")
		.mockImplementation(() => {});

	globalThis.fetch = vi.fn(async (input) => {
		const url = String(input);

		if (url === `${API_BASE}/homes/code/testhome`) {
			return jsonResponse({
				_id: "home-1",
				homeName: "Test Home",
			});
		}

		return {
			ok: false,
			json: async () => ({}),
		} as Response;
	}) as unknown as typeof fetch;

	renderChorePageWithHistory();

	expect(await screen.findByText("No Chores")).toBeInTheDocument();
	expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));

	consoleErrorSpy.mockRestore();
});

test("keeps chore list empty when add chore request fails", async () => {
	const consoleErrorSpy = vi
		.spyOn(console, "error")
		.mockImplementation(() => {});

	globalThis.fetch = vi.fn(async (input, init) => {
		const url = String(input);
		const method = init?.method ?? "GET";

		if (url === `${API_BASE}/homes/code/testhome`) {
			return jsonResponse({
				_id: "home-1",
				homeName: "Test Home",
			});
		}

		if (url === `${API_BASE}/testhome/chores` && method === "GET") {
			return jsonResponse([]);
		}

		if (url === `${API_BASE}/testhome/chores` && method === "POST") {
			return {
				ok: false,
				json: async () => ({}),
			} as Response;
		}

		throw new Error(`Unhandled fetch: ${method} ${url}`);
	}) as unknown as typeof fetch;

	renderChorePageWithHistory();

	await screen.findByText("No Chores");

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "+" }));
	await user.type(screen.getByPlaceholderText("enter text"), "Wash dishes");
	await user.click(screen.getByRole("button", { name: "Submit" }));

	await waitFor(() =>
		expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error))
	);

	expect(screen.getByText("No Chores")).toBeInTheDocument();

	consoleErrorSpy.mockRestore();
});

test("keeps chore when delete request fails", async () => {
	const consoleErrorSpy = vi
		.spyOn(console, "error")
		.mockImplementation(() => {});

	globalThis.fetch = vi.fn(async (input, init) => {
		const url = String(input);
		const method = init?.method ?? "GET";

		if (url === `${API_BASE}/homes/code/testhome`) {
			return jsonResponse({
				_id: "home-1",
				homeName: "Test Home",
			});
		}

		if (url === `${API_BASE}/testhome/chores` && method === "GET") {
			return jsonResponse([
				{
					_id: "chore-1",
					title: "Take out trash",
					homeId: "home-1",
				},
			]);
		}

		if (
			url === `${API_BASE}/testhome/chores/chore-1` &&
			method === "DELETE"
		) {
			return {
				ok: false,
				json: async () => ({}),
			} as Response;
		}

		throw new Error(`Unhandled fetch: ${method} ${url}`);
	}) as unknown as typeof fetch;

	renderChorePageWithHistory();

	expect(await screen.findByText("Take out trash")).toBeInTheDocument();

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "-" }));
	await user.click(getTrashButton());

	await waitFor(() =>
		expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error))
	);

	expect(screen.getByText("Take out trash")).toBeInTheDocument();

	consoleErrorSpy.mockRestore();
});
