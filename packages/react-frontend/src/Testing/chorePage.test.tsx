import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";
import ChorePage from "../pages/chorePage";

jest.mock("../components/list", () => {
	return function MockList(props: {
		items: Array<{ _id?: string; title?: string } | string>;
		handleAddClick: () => void;
		handleRemoveClick: (
			item: { _id?: string; title?: string } | string
		) => void;
	}) {
		return (
			<div>
				<button onClick={props.handleAddClick}>+</button>

				{props.items.map((item, index) => {
					const label =
						typeof item === "string" ? item : (item.title ?? "");

					const key =
						typeof item === "string"
							? item
							: (item._id ?? `${label}-${index}`);

					return (
						<div key={key}>
							<span>{label}</span>

							{typeof item !== "string" && item._id && (
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

function renderChorePageWithHistory() {
	return render(
		<MemoryRouter
			initialEntries={[
				"/home/testuser/testhome",
				"/chores/testuser/testhome",
			]}
			initialIndex={1}
		>
			<Routes>
				<Route
					path="/home/:username/:homeCode"
					element={<div>Home Page</div>}
				/>
				<Route
					path="/chores/:username/:homeCode"
					element={<ChorePage />}
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

async function renderLoadedChorePage() {
	renderChorePageWithHistory();

	await act(async () => {
		await flushPromises();
	});
}

function mockFetchWithChores(chores: any[]) {
	globalThis.fetch = jest.fn().mockResolvedValueOnce({
		ok: true,
		json: async () => chores,
	}) as jest.Mock;
}

beforeEach(() => {
	mockFetchWithChores([]);
});

afterEach(() => {
	jest.clearAllMocks();
});

test("clicking the add button opens the add overlay", async () => {
	await renderLoadedChorePage();

	fireEvent.click(screen.getByRole("button", { name: "+" }));

	expect(screen.getByText("Add Chore")).toBeInTheDocument();
	expect(screen.getByPlaceholderText("enter text")).toBeInTheDocument();
	expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
});

test("clicking the back button sends you to the previous page", async () => {
	await renderLoadedChorePage();

	fireEvent.click(screen.getByRole("button", { name: "←" }));

	expect(screen.getByText("Home Page")).toBeInTheDocument();
});

test("submitting a new chore sends a POST request", async () => {
	globalThis.fetch = jest
		.fn()
		// Initial fetch chores
		.mockResolvedValueOnce({
			ok: true,
			json: async () => [],
		})
		// POST chore
		.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				_id: "chore-1",
				title: "Wash dishes",
				assignedTo: "Robert",
			}),
		}) as jest.Mock;

	await renderLoadedChorePage();

	fireEvent.click(screen.getByRole("button", { name: "+" }));

	fireEvent.change(screen.getByPlaceholderText("enter text"), {
		target: { value: "Wash dishes" },
	});

	await act(async () => {
		fireEvent.click(screen.getByRole("button", { name: "Submit" }));
		await flushPromises();
	});

	expect(globalThis.fetch).toHaveBeenNthCalledWith(
		2,
		"http://localhost:8000/testhome/chores",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				title: "Wash dishes",
			}),
		}
	);
});

test("clicking remove sends a DELETE request", async () => {
	globalThis.fetch = jest
		.fn()
		// Initial fetch chores
		.mockResolvedValueOnce({
			ok: true,
			json: async () => [
				{
					_id: "chore-1",
					title: "Take out trash",
				},
			],
		})
		// DELETE chore
		.mockResolvedValueOnce({
			ok: true,
			json: async () => ({}),
		}) as jest.Mock;

	await renderLoadedChorePage();

	fireEvent.click(
		screen.getByRole("button", {
			name: "remove Take out trash",
		})
	);

	await act(async () => {
		await flushPromises();
	});

	expect(globalThis.fetch).toHaveBeenNthCalledWith(
		2,
		"http://localhost:8000/testhome/chores/chore-1",
		{
			method: "DELETE",
		}
	);
});
