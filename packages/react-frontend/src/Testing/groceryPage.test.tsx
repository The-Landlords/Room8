import * as React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom/vitest";
import { afterEach, expect, test, vi } from "vitest";
import GroceryPage from "../pages/groceryPage";
import { API_BASE } from "../config";

type TestGrocery = {
	_id: string;
	title: string;
	quantity: number;
	price?: number;
	homeId: string;
	status: "PENDING" | "PURCHASED" | "CANCELLED";
};

function renderGroceryPageWithHistory() {
	return render(
		<MemoryRouter
			initialEntries={[
				"/home/testuser/testhome",
				"/grocery/testuser/testhome",
			]}
			initialIndex={1}
		>
			<Routes>
				<Route
					path="/home/:username/:homeCode"
					element={<div>Home Page</div>}
				/>
				<Route
					path="/grocery/:username/:homeCode"
					element={<GroceryPage />}
				/>
			</Routes>
		</MemoryRouter>
	);
}

function mockFetchWithGroceries(groceries: TestGrocery[]) {
	globalThis.fetch = vi.fn(async () => {
		return {
			ok: true,
			json: async () => groceries,
			text: async () => "",
		} as unknown as Response;
	}) as unknown as typeof fetch;
}

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

test("fetches and displays groceries", async () => {
	mockFetchWithGroceries([
		{
			_id: "grocery-1",
			title: "Milk",
			quantity: 2,
			price: 4,
			homeId: "home-1",
			status: "PENDING",
		},
	]);

	renderGroceryPageWithHistory();

	expect(await screen.findByText("Milk")).toBeInTheDocument();

	expect(globalThis.fetch).toHaveBeenCalledWith(
		`${API_BASE}/testhome/grocery`,
		{
			credentials: "include",
		}
	);
});

test("displays the empty grocery state on the real page", async () => {
	mockFetchWithGroceries([]);

	renderGroceryPageWithHistory();

	expect(await screen.findByText("No Groceries")).toBeInTheDocument();
});

test("renders the real add grocery button", async () => {
	mockFetchWithGroceries([]);

	renderGroceryPageWithHistory();

	await screen.findByText("No Groceries");

	expect(screen.getByRole("button", { name: "+" })).toBeInTheDocument();
});

test("clicking the add button opens the add overlay", async () => {
	mockFetchWithGroceries([]);

	renderGroceryPageWithHistory();

	await screen.findByText("No Groceries");

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "+" }));

	expect(screen.getByText("Add Grocery")).toBeInTheDocument();

	expect(
		screen.getByPlaceholderText("enter grocery item")
	).toBeInTheDocument();

	expect(screen.getByPlaceholderText("Quantity")).toBeInTheDocument();

	expect(screen.getByPlaceholderText("Price, optional")).toBeInTheDocument();

	expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
});

test("clicking the back button sends you to the previous page", async () => {
	mockFetchWithGroceries([]);

	renderGroceryPageWithHistory();

	await screen.findByText("No Groceries");

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: /back/i }));

	expect(screen.getByText("Home Page")).toBeInTheDocument();
});

test("submitting a new grocery sends a POST request with quantity and price", async () => {
	const fetchMock = vi.fn(
		async (_url: RequestInfo | URL, options?: RequestInit) => {
			if (options?.method === "POST") {
				return {
					ok: true,
					json: async () => ({
						_id: "grocery-1",
						title: "Eggs",
						quantity: 12,
						price: 3.49,
						homeId: "home-1",
						status: "PENDING",
					}),
					text: async () => "",
				} as unknown as Response;
			}

			return {
				ok: true,
				json: async () => [],
				text: async () => "",
			} as unknown as Response;
		}
	);

	globalThis.fetch = fetchMock as unknown as typeof fetch;

	renderGroceryPageWithHistory();

	await screen.findByText("No Groceries");

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "+" }));

	await user.type(screen.getByPlaceholderText("enter grocery item"), "Eggs");

	await user.clear(screen.getByPlaceholderText("Quantity"));
	await user.type(screen.getByPlaceholderText("Quantity"), "12");

	await user.type(screen.getByPlaceholderText("Price, optional"), "3.49");

	await user.click(screen.getByRole("button", { name: "Submit" }));

	await waitFor(() => {
		expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/testhome/grocery`, {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				title: "Eggs",
				quantity: 12,
				price: 3.49,
			}),
		});
	});

	expect(await screen.findByText("Eggs")).toBeInTheDocument();
});

test("submitting a new grocery without price sends price as 0", async () => {
	const fetchMock = vi.fn(
		async (_url: RequestInfo | URL, options?: RequestInit) => {
			if (options?.method === "POST") {
				return {
					ok: true,
					json: async () => ({
						_id: "grocery-1",
						title: "Bread",
						quantity: 2,
						price: 0,
						homeId: "home-1",
						status: "PENDING",
					}),
					text: async () => "",
				} as unknown as Response;
			}

			return {
				ok: true,
				json: async () => [],
				text: async () => "",
			} as unknown as Response;
		}
	);

	globalThis.fetch = fetchMock as unknown as typeof fetch;

	renderGroceryPageWithHistory();

	await screen.findByText("No Groceries");

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "+" }));

	await user.type(screen.getByPlaceholderText("enter grocery item"), "Bread");

	await user.clear(screen.getByPlaceholderText("Quantity"));
	await user.type(screen.getByPlaceholderText("Quantity"), "2");

	await user.click(screen.getByRole("button", { name: "Submit" }));

	await waitFor(() => {
		expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/testhome/grocery`, {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				title: "Bread",
				quantity: 2,
				price: 0,
			}),
		});
	});

	expect(await screen.findByText("Bread")).toBeInTheDocument();
});

test("does not submit grocery if quantity is invalid", async () => {
	mockFetchWithGroceries([]);

	renderGroceryPageWithHistory();

	await screen.findByText("No Groceries");

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "+" }));

	await user.type(
		screen.getByPlaceholderText("enter grocery item"),
		"Apples"
	);

	await user.clear(screen.getByPlaceholderText("Quantity"));
	await user.type(screen.getByPlaceholderText("Quantity"), "0");

	await user.click(screen.getByRole("button", { name: "Submit" }));

	expect(globalThis.fetch).not.toHaveBeenCalledWith(
		`${API_BASE}/testhome/grocery`,
		expect.objectContaining({
			method: "POST",
		})
	);
});

test("does not submit grocery if price is negative", async () => {
	mockFetchWithGroceries([]);

	renderGroceryPageWithHistory();

	await screen.findByText("No Groceries");

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "+" }));

	await user.type(
		screen.getByPlaceholderText("enter grocery item"),
		"Apples"
	);

	await user.clear(screen.getByPlaceholderText("Quantity"));
	await user.type(screen.getByPlaceholderText("Quantity"), "3");

	await user.type(screen.getByPlaceholderText("Price, optional"), "-1");

	await user.click(screen.getByRole("button", { name: "Submit" }));

	expect(globalThis.fetch).not.toHaveBeenCalledWith(
		`${API_BASE}/testhome/grocery`,
		expect.objectContaining({
			method: "POST",
		})
	);
});

test("clicking remove sends a DELETE request", async () => {
	const fetchMock = vi.fn(
		async (_url: RequestInfo | URL, options?: RequestInit) => {
			if (options?.method === "DELETE") {
				return {
					ok: true,
					json: async () => ({}),
					text: async () => "",
				} as unknown as Response;
			}

			return {
				ok: true,
				json: async () => [
					{
						_id: "grocery-1",
						title: "Milk",
						quantity: 2,
						price: 4,
						homeId: "home-1",
						status: "PENDING",
					},
				],
				text: async () => "",
			} as unknown as Response;
		}
	);

	globalThis.fetch = fetchMock as unknown as typeof fetch;

	renderGroceryPageWithHistory();

	expect(await screen.findByText("Milk")).toBeInTheDocument();

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "-" }));

	const trashButton = screen.getAllByRole("button").find((button) => {
		return button.querySelector("svg[data-icon='trash-can']");
	});

	if (!trashButton) {
		throw new Error("Trash button was not found");
	}

	await user.click(trashButton);

	await waitFor(() => {
		expect(fetchMock).toHaveBeenCalledWith(
			`${API_BASE}/testhome/grocery/grocery-1`,
			{
				method: "DELETE",
				credentials: "include",
			}
		);
	});

	expect(await screen.findByText("No Groceries")).toBeInTheDocument();
});

test("renders grocery without a price", async () => {
	mockFetchWithGroceries([
		{
			_id: "grocery-1",
			title: "Bananas",
			quantity: 6,
			homeId: "home-1",
			status: "PENDING",
		},
	]);

	renderGroceryPageWithHistory();

	expect(await screen.findByText("Bananas")).toBeInTheDocument();
	expect(screen.getByText("Qty: 6")).toBeInTheDocument();
	expect(screen.queryByText(/\$0\.00/)).not.toBeInTheDocument();
});

test("shows empty groceries when grocery fetch fails", async () => {
	const consoleErrorSpy = vi
		.spyOn(console, "error")
		.mockImplementation(() => {});

	globalThis.fetch = vi.fn(async (input) => {
		const url = String(input);

		if (url === `${API_BASE}/homes/code/testhome`) {
			return {
				ok: true,
				json: async () => ({
					_id: "home-1",
					homeName: "Test Home",
				}),
				text: async () => "",
			} as Response;
		}

		return {
			ok: false,
			json: async () => ({}),
			text: async () => "No groceries",
		} as Response;
	}) as unknown as typeof fetch;

	renderGroceryPageWithHistory();

	expect(await screen.findByText("No Groceries")).toBeInTheDocument();
	expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));

	consoleErrorSpy.mockRestore();
});

test("keeps grocery list empty when add grocery request fails", async () => {
	const consoleErrorSpy = vi
		.spyOn(console, "error")
		.mockImplementation(() => {});

	globalThis.fetch = vi.fn(async (input, init) => {
		const url = String(input);
		const method = init?.method ?? "GET";

		if (url === `${API_BASE}/homes/code/testhome`) {
			return {
				ok: true,
				json: async () => ({
					_id: "home-1",
					homeName: "Test Home",
				}),
				text: async () => "",
			} as Response;
		}

		if (url === `${API_BASE}/testhome/grocery` && method === "GET") {
			return {
				ok: true,
				json: async () => [],
				text: async () => "",
			} as Response;
		}

		if (url === `${API_BASE}/testhome/grocery` && method === "POST") {
			return {
				ok: false,
				json: async () => ({}),
				text: async () => "Add failed",
			} as Response;
		}

		throw new Error(`Unhandled fetch: ${method} ${url}`);
	}) as unknown as typeof fetch;

	renderGroceryPageWithHistory();

	await screen.findByText("No Groceries");

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "+" }));
	await user.type(
		screen.getByPlaceholderText("enter grocery item"),
		"Apples"
	);
	await user.clear(screen.getByPlaceholderText("Quantity"));
	await user.type(screen.getByPlaceholderText("Quantity"), "3");
	await user.click(screen.getByRole("button", { name: "Submit" }));

	await waitFor(() =>
		expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error))
	);

	expect(screen.getByText("No Groceries")).toBeInTheDocument();

	consoleErrorSpy.mockRestore();
});

test("keeps grocery when delete request fails", async () => {
	const consoleErrorSpy = vi
		.spyOn(console, "error")
		.mockImplementation(() => {});

	globalThis.fetch = vi.fn(async (input, init) => {
		const url = String(input);
		const method = init?.method ?? "GET";

		if (url === `${API_BASE}/homes/code/testhome`) {
			return {
				ok: true,
				json: async () => ({
					_id: "home-1",
					homeName: "Test Home",
				}),
				text: async () => "",
			} as Response;
		}

		if (url === `${API_BASE}/testhome/grocery` && method === "GET") {
			return {
				ok: true,
				json: async () => [
					{
						_id: "grocery-1",
						title: "Milk",
						quantity: 2,
						price: 4,
						homeId: "home-1",
						status: "PENDING",
					},
				],
				text: async () => "",
			} as Response;
		}

		if (
			url === `${API_BASE}/testhome/grocery/grocery-1` &&
			method === "DELETE"
		) {
			return {
				ok: false,
				json: async () => ({}),
				text: async () => "Delete failed",
			} as Response;
		}

		throw new Error(`Unhandled fetch: ${method} ${url}`);
	}) as unknown as typeof fetch;

	renderGroceryPageWithHistory();

	expect(await screen.findByText("Milk")).toBeInTheDocument();

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "-" }));

	const trashButton = screen.getAllByRole("button").find((button) => {
		return button.querySelector("svg[data-icon='trash-can']");
	});

	if (!trashButton) {
		throw new Error("Trash button was not found");
	}

	await user.click(trashButton);

	await waitFor(() =>
		expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error))
	);

	expect(screen.getByText("Milk")).toBeInTheDocument();

	consoleErrorSpy.mockRestore();
});
