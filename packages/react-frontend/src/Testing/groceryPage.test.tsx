import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GroceryPage from "./groceryPage";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
	const actual =
		await vi.importActual<typeof import("react-router-dom")>(
			"react-router-dom"
		);

	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

function renderGroceryPage() {
	return render(
		<MemoryRouter initialEntries={["/grocery/john-pork/BDqoIE"]}>
			<Routes>
				<Route
					path="/grocery/:username/:homeCode"
					element={<GroceryPage />}
				/>
			</Routes>
		</MemoryRouter>
	);
}

describe("GroceryPage", () => {
	beforeEach(() => {
		mockNavigate.mockClear();
		vi.restoreAllMocks();
	});

	it("fetches and displays groceries", async () => {
		vi.spyOn(global, "fetch").mockResolvedValueOnce({
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
		} as Response);

		renderGroceryPage();

		expect(
			await screen.findByText("Milk - Qty: 2 - $4")
		).toBeInTheDocument();
		expect(global.fetch).toHaveBeenCalledWith(
			"http://localhost:8000/BDqoIE/grocery"
		);
	});

	it("opens the add grocery overlay", async () => {
		const user = userEvent.setup();

		vi.spyOn(global, "fetch").mockResolvedValueOnce({
			ok: true,
			json: async () => [],
		} as Response);

		renderGroceryPage();

		await user.click(screen.getByRole("button", { name: /add/i }));

		expect(screen.getByText("Add Grocery")).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText("enter grocery item")
		).toBeInTheDocument();
	});

	it("adds a grocery item", async () => {
		const user = userEvent.setup();
		const fetchMock = vi.spyOn(global, "fetch");

		fetchMock
			.mockResolvedValueOnce({
				ok: true,
				json: async () => [],
			} as Response)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					_id: "grocery-2",
					title: "Eggs",
					quantity: 1,
					price: 0,
					homeId: "home-1",
					status: "PENDING",
				}),
			} as Response);

		renderGroceryPage();

		await user.click(screen.getByRole("button", { name: /add/i }));
		await user.type(
			screen.getByPlaceholderText("enter grocery item"),
			"Eggs"
		);
		await user.click(screen.getByRole("button", { name: /submit/i }));

		await waitFor(() => {
			expect(fetchMock).toHaveBeenLastCalledWith(
				"http://localhost:8000/BDqoIE/grocery",
				expect.objectContaining({
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						title: "Eggs",
						quantity: 1,
						price: 0,
					}),
				})
			);
		});

		expect(
			await screen.findByText("Eggs - Qty: 1 - $0")
		).toBeInTheDocument();
	});

	it("goes back when the back button is clicked", async () => {
		const user = userEvent.setup();

		vi.spyOn(global, "fetch").mockResolvedValueOnce({
			ok: true,
			json: async () => [],
		} as Response);

		renderGroceryPage();

		await user.click(screen.getByRole("button", { name: "←" }));

		expect(mockNavigate).toHaveBeenCalledWith(-1);
	});
});
