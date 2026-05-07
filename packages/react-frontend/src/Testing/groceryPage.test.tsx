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

	expect(screen.getByText("Milk - Qty: 2 - $4")).toBeInTheDocument();
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
	expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
});

test("clicking the back button sends you to the previous page", async () => {
	await renderLoadedGroceryPage();

	fireEvent.click(screen.getByRole("button", { name: "←" }));

	expect(screen.getByText("Home Page")).toBeInTheDocument();
});

test("submitting a new grocery sends a POST request", async () => {
	globalThis.fetch = jest
		.fn()
		// Initial fetch groceries
		.mockResolvedValueOnce({
			ok: true,
			json: async () => [],
		})
		// POST grocery
		.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				_id: "grocery-1",
				title: "Eggs",
				quantity: 1,
				price: 0,
				homeId: "home-1",
				status: "PENDING",
			}),
		}) as jest.Mock;

	await renderLoadedGroceryPage();

	fireEvent.click(screen.getByRole("button", { name: "+" }));

	fireEvent.change(screen.getByPlaceholderText("enter grocery item"), {
		target: { value: "Eggs" },
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
				quantity: 1,
				price: 0,
			}),
		}
	);

	expect(screen.getByText("Eggs - Qty: 1 - $0")).toBeInTheDocument();
});

test("clicking remove sends a DELETE request", async () => {
	globalThis.fetch = jest
		.fn()
		// Initial fetch groceries
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
		// DELETE grocery
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
