import * as React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
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
	globalThis.fetch = vi.fn().mockResolvedValueOnce({
		ok: true,
		json: async () => groceries,
	}) as unknown as typeof fetch;
}

beforeEach(() => {
	mockFetchWithGroceries([]);
});

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

	expect(
		await screen.findByText("Milk - Qty: 2 - $4.00")
	).toBeInTheDocument();

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

	expect(await screen.findByText("No Grocery")).toBeInTheDocument();
});

test("renders the real add grocery button", async () => {
	mockFetchWithGroceries([]);

	renderGroceryPageWithHistory();

	await screen.findByText("No Grocery");

	expect(screen.getByRole("button", { name: "+" })).toBeInTheDocument();
});

test("clicking the add button opens the add overlay", async () => {
	mockFetchWithGroceries([]);

	renderGroceryPageWithHistory();

	await screen.findByText("No Grocery");

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

	await screen.findByText("No Grocery");

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "←" }));

	expect(screen.getByText("Home Page")).toBeInTheDocument();
});

test("submitting a new grocery sends a POST request with quantity and price", async () => {
	globalThis.fetch = vi
		.fn()
		.mockResolvedValueOnce({
			ok: true,
			json: async () => [],
		})
		.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				_id: "grocery-1",
				title: "Eggs",
				quantity: 12,
				price: 3.49,
				homeId: "home-1",
				status: "PENDING",
			}),
		}) as unknown as typeof fetch;

	renderGroceryPageWithHistory();

	await screen.findByText("No Grocery");

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "+" }));

	await user.type(screen.getByPlaceholderText("enter grocery item"), "Eggs");

	await user.clear(screen.getByPlaceholderText("Quantity"));
	await user.type(screen.getByPlaceholderText("Quantity"), "12");

	await user.type(screen.getByPlaceholderText("Price, optional"), "3.49");

	await user.click(screen.getByRole("button", { name: "Submit" }));

	await waitFor(() => {
		expect(globalThis.fetch).toHaveBeenNthCalledWith(
			2,
			`${API_BASE}/testhome/grocery`,
			{
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
			}
		);
	});

	expect(
		await screen.findByText("Eggs - Qty: 12 - $3.49")
	).toBeInTheDocument();
});

test("submitting a new grocery without price sends price as 0", async () => {
	globalThis.fetch = vi
		.fn()
		.mockResolvedValueOnce({
			ok: true,
			json: async () => [],
		})
		.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				_id: "grocery-1",
				title: "Bread",
				quantity: 2,
				price: 0,
				homeId: "home-1",
				status: "PENDING",
			}),
		}) as unknown as typeof fetch;

	renderGroceryPageWithHistory();

	await screen.findByText("No Grocery");

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "+" }));

	await user.type(screen.getByPlaceholderText("enter grocery item"), "Bread");

	await user.clear(screen.getByPlaceholderText("Quantity"));
	await user.type(screen.getByPlaceholderText("Quantity"), "2");

	await user.click(screen.getByRole("button", { name: "Submit" }));

	await waitFor(() => {
		expect(globalThis.fetch).toHaveBeenNthCalledWith(
			2,
			`${API_BASE}/testhome/grocery`,
			{
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
			}
		);
	});

	expect(
		await screen.findByText("Bread - Qty: 2 - $0.00")
	).toBeInTheDocument();
});

test("does not submit grocery if quantity is invalid", async () => {
	globalThis.fetch = vi.fn().mockResolvedValueOnce({
		ok: true,
		json: async () => [],
	}) as unknown as typeof fetch;

	renderGroceryPageWithHistory();

	await screen.findByText("No Grocery");

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "+" }));

	await user.type(
		screen.getByPlaceholderText("enter grocery item"),
		"Apples"
	);

	await user.clear(screen.getByPlaceholderText("Quantity"));
	await user.type(screen.getByPlaceholderText("Quantity"), "0");

	await user.click(screen.getByRole("button", { name: "Submit" }));

	expect(globalThis.fetch).toHaveBeenCalledTimes(1);
});

test("does not submit grocery if price is negative", async () => {
	globalThis.fetch = vi.fn().mockResolvedValueOnce({
		ok: true,
		json: async () => [],
	}) as unknown as typeof fetch;

	renderGroceryPageWithHistory();

	await screen.findByText("No Grocery");

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

	expect(globalThis.fetch).toHaveBeenCalledTimes(1);
});

test("clicking remove sends a DELETE request", async () => {
	globalThis.fetch = vi
		.fn()
		.mockResolvedValueOnce({
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
		})
		.mockResolvedValueOnce({
			ok: true,
			json: async () => ({}),
		}) as unknown as typeof fetch;

	renderGroceryPageWithHistory();

	expect(
		await screen.findByText("Milk - Qty: 2 - $4.00")
	).toBeInTheDocument();

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "-" }));

	const trashButton = screen
		.getAllByRole("button")
		.find((button) => button.querySelector("svg[data-icon='trash-can']"));

	expect(trashButton).toBeDefined();

	await user.click(trashButton as HTMLButtonElement);

	await waitFor(() => {
		expect(globalThis.fetch).toHaveBeenNthCalledWith(
			2,
			`${API_BASE}/testhome/grocery/grocery-1`,
			{
				method: "DELETE",
				credentials: "include",
			}
		);
	});
});
