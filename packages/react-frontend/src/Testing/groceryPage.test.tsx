import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";
import GroceryPage from "../pages/groceryPage";

jest.mock("../components/list", () => {
	return function MockList(props: {
		items: Array<{
			_id?: string;
			title?: string;
			quantity?: number;
			price?: number;
		}>;
		handleAddClick: () => void;
		handleRemoveClick: (item: {
			_id?: string;
			title?: string;
			quantity?: number;
			price?: number;
		}) => void;
		renderItem: (item: {
			_id?: string;
			title?: string;
			quantity?: number;
			price?: number;
		}) => React.ReactNode;
	}) {
		return (
			<div>
				<button onClick={props.handleAddClick}>+</button>

				{props.items.map((item, index) => {
					const label = item.title ?? "";
					const key = item._id ?? `${label}-${index}`;

					return (
						<div key={key}>
							{props.renderItem(item)}

							{item._id && (
								<button
									onClick={() =>
										props.handleRemoveClick(item)
									}
								>
									remove {label}
								</button>
							)}
						</div>
					);
				})}
			</div>
		);
	};
});

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

async function flushPromises() {
	await Promise.resolve();
	await Promise.resolve();
	await Promise.resolve();
}

async function renderLoadedGroceryPage() {
	renderGroceryPageWithHistory();

	await act(async () => {
		await flushPromises();
	});
}

function mockFetchWithGroceries(groceries: any[]) {
	globalThis.fetch = jest.fn().mockResolvedValueOnce({
		ok: true,
		json: async () => groceries,
	}) as jest.Mock;
}

beforeEach(() => {
	mockFetchWithGroceries([]);
});

afterEach(() => {
	jest.clearAllMocks();
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

	await renderLoadedGroceryPage();

	expect(screen.getByText("Milk - Qty: 2 - $4.00")).toBeInTheDocument();

	expect(globalThis.fetch).toHaveBeenCalledWith(
		"http://localhost:8000/testhome/grocery"
	);
});

test("clicking the add button opens the add overlay", async () => {
	await renderLoadedGroceryPage();

	fireEvent.click(screen.getByRole("button", { name: "+" }));

	expect(screen.getByText("Add Grocery")).toBeInTheDocument();

	expect(
		screen.getByPlaceholderText("enter grocery item")
	).toBeInTheDocument();

	expect(screen.getByPlaceholderText("Quantity")).toBeInTheDocument();

	expect(screen.getByPlaceholderText("Price, optional")).toBeInTheDocument();

	expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
});

test("clicking the back button sends you to the previous page", async () => {
	await renderLoadedGroceryPage();

	fireEvent.click(screen.getByRole("button", { name: "←" }));

	expect(screen.getByText("Home Page")).toBeInTheDocument();
});

test("submitting a new grocery sends a POST request with quantity and price", async () => {
	globalThis.fetch = jest
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
		}) as jest.Mock;

	await renderLoadedGroceryPage();

	fireEvent.click(screen.getByRole("button", { name: "+" }));

	fireEvent.change(screen.getByPlaceholderText("enter grocery item"), {
		target: { value: "Eggs" },
	});

	fireEvent.change(screen.getByPlaceholderText("Quantity"), {
		target: { value: "12" },
	});

	fireEvent.change(screen.getByPlaceholderText("Price, optional"), {
		target: { value: "3.49" },
	});

	await act(async () => {
		fireEvent.click(screen.getByRole("button", { name: "Submit" }));
		await flushPromises();
	});

	expect(globalThis.fetch).toHaveBeenNthCalledWith(
		2,
		"http://localhost:8000/testhome/grocery",
		{
			method: "POST",
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

	expect(screen.getByText("Eggs - Qty: 12 - $3.49")).toBeInTheDocument();
});

test("submitting a new grocery without price sends price as 0", async () => {
	globalThis.fetch = jest
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
		}) as jest.Mock;

	await renderLoadedGroceryPage();

	fireEvent.click(screen.getByRole("button", { name: "+" }));

	fireEvent.change(screen.getByPlaceholderText("enter grocery item"), {
		target: { value: "Bread" },
	});

	fireEvent.change(screen.getByPlaceholderText("Quantity"), {
		target: { value: "2" },
	});

	await act(async () => {
		fireEvent.click(screen.getByRole("button", { name: "Submit" }));
		await flushPromises();
	});

	expect(globalThis.fetch).toHaveBeenNthCalledWith(
		2,
		"http://localhost:8000/testhome/grocery",
		{
			method: "POST",
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

	expect(screen.getByText("Bread - Qty: 2 - $0.00")).toBeInTheDocument();
});

test("does not submit grocery if quantity is invalid", async () => {
	globalThis.fetch = jest.fn().mockResolvedValueOnce({
		ok: true,
		json: async () => [],
	}) as jest.Mock;

	await renderLoadedGroceryPage();

	fireEvent.click(screen.getByRole("button", { name: "+" }));

	fireEvent.change(screen.getByPlaceholderText("enter grocery item"), {
		target: { value: "Apples" },
	});

	fireEvent.change(screen.getByPlaceholderText("Quantity"), {
		target: { value: "0" },
	});

	await act(async () => {
		fireEvent.click(screen.getByRole("button", { name: "Submit" }));
		await flushPromises();
	});

	expect(globalThis.fetch).toHaveBeenCalledTimes(1);
});

test("does not submit grocery if price is negative", async () => {
	globalThis.fetch = jest.fn().mockResolvedValueOnce({
		ok: true,
		json: async () => [],
	}) as jest.Mock;

	await renderLoadedGroceryPage();

	fireEvent.click(screen.getByRole("button", { name: "+" }));

	fireEvent.change(screen.getByPlaceholderText("enter grocery item"), {
		target: { value: "Apples" },
	});

	fireEvent.change(screen.getByPlaceholderText("Quantity"), {
		target: { value: "3" },
	});

	fireEvent.change(screen.getByPlaceholderText("Price, optional"), {
		target: { value: "-1" },
	});

	await act(async () => {
		fireEvent.click(screen.getByRole("button", { name: "Submit" }));
		await flushPromises();
	});

	expect(globalThis.fetch).toHaveBeenCalledTimes(1);
});

test("clicking remove sends a DELETE request", async () => {
	globalThis.fetch = jest
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
		}) as jest.Mock;

	await renderLoadedGroceryPage();

	fireEvent.click(
		screen.getByRole("button", {
			name: "remove Milk",
		})
	);

	await act(async () => {
		await flushPromises();
	});

	expect(globalThis.fetch).toHaveBeenNthCalledWith(
		2,
		"http://localhost:8000/testhome/grocery/grocery-1",
		{
			method: "DELETE",
		}
	);
});
