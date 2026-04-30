import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
							<button
								onClick={() => props.handleRemoveClick(item)}
							>
								remove {label}
							</button>
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

beforeEach(() => {
	globalThis.fetch = jest.fn().mockResolvedValue({
		ok: true,
		json: async () => [],
	}) as jest.Mock;
});

afterEach(() => {
	jest.clearAllMocks();
});

test("clicking the add button opens the add overlay", async () => {
	const user = userEvent.setup();

	renderChorePageWithHistory();

	const addButton = await screen.findByRole("button", { name: "+" });
	await user.click(addButton);

	expect(await screen.findByText("Add Chore")).toBeInTheDocument();
	expect(
		await screen.findByPlaceholderText("enter text")
	).toBeInTheDocument();
	expect(
		await screen.findByRole("button", { name: "Submit" })
	).toBeInTheDocument();
});

test("clicking the back button sends you to the previous page", async () => {
	const user = userEvent.setup();

	renderChorePageWithHistory();

	const backButton = await screen.findByRole("button", { name: "←" });
	await user.click(backButton);

	expect(await screen.findByText("Home Page")).toBeInTheDocument();
});

test("submitting a new chore sends a POST request", async () => {
	const user = userEvent.setup();

	globalThis.fetch = jest
		.fn()
		.mockResolvedValueOnce({
			ok: true,
			json: async () => [],
		})
		.mockResolvedValueOnce({
			ok: true,
			json: async () => [
				{
					_id: "chore-1",
					title: "Wash dishes",
					assignedTo: "Robert",
				},
			],
		}) as jest.Mock;

	renderChorePageWithHistory();

	const addButton = await screen.findByRole("button", { name: "+" });
	await user.click(addButton);

	const input = await screen.findByPlaceholderText("enter text");
	await user.type(input, "Wash dishes");

	const submitButton = await screen.findByRole("button", {
		name: "Submit",
	});
	await user.click(submitButton);

	await waitFor(() => {
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
});

test("clicking remove sends a DELETE request", async () => {
	const user = userEvent.setup();

	globalThis.fetch = jest
		.fn()
		.mockResolvedValueOnce({
			ok: true,
			json: async () => [
				{
					_id: "chore-1",
					title: "Take out trash",
				},
			],
		})
		.mockResolvedValueOnce({
			ok: true,
			json: async () => ({}),
		}) as jest.Mock;

	renderChorePageWithHistory();

	const removeButton = await screen.findByRole("button", {
		name: "remove Take out trash",
	});
	await user.click(removeButton);

	await waitFor(() => {
		expect(globalThis.fetch).toHaveBeenNthCalledWith(
			2,
			"http://localhost:8000/testhome/chores/chore-1",
			{
				method: "DELETE",
			}
		);
	});
});
