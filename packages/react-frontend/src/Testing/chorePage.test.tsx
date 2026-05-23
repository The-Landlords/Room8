import * as React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import ChorePage from "../pages/chorePage";
import { API_BASE } from "../config";

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

function mockFetchWithChores(chores: any[]) {
	globalThis.fetch = vi.fn().mockResolvedValueOnce({
		ok: true,
		json: async () => chores,
	}) as unknown as typeof fetch;
}

beforeEach(() => {
	mockFetchWithChores([]);
});

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

test("fetches and displays chores", async () => {
	mockFetchWithChores([
		{
			_id: "chore-1",
			title: "Take out trash",
			homeId: "home-1",
		},
	]);

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
	mockFetchWithChores([]);

	renderChorePageWithHistory();

	expect(await screen.findByText("No Chores")).toBeInTheDocument();
});

test("renders the real add chore button", async () => {
	mockFetchWithChores([]);

	renderChorePageWithHistory();

	await screen.findByText("No Chores");

	expect(screen.getByRole("button", { name: "+" })).toBeInTheDocument();
});

test("clicking the add button opens the add overlay", async () => {
	mockFetchWithChores([]);

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
	mockFetchWithChores([]);

	renderChorePageWithHistory();

	await screen.findByText("No Chores");
	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "←" }));

	expect(screen.getByText("Home Page")).toBeInTheDocument();
});

test("submitting a new chore sends a POST request", async () => {
	globalThis.fetch = vi
		.fn()
		.mockResolvedValueOnce({
			ok: true,
			json: async () => [],
		})
		.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				_id: "chore-1",
				title: "Wash dishes",
				homeId: "home-1",
			}),
		}) as unknown as typeof fetch;

	renderChorePageWithHistory();

	await screen.findByText("No Chores");
	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "+" }));
	await user.type(screen.getByPlaceholderText("enter text"), "Wash dishes");
	await user.click(screen.getByRole("button", { name: "Submit" }));

	await waitFor(() => {
		expect(globalThis.fetch).toHaveBeenNthCalledWith(
			2,
			`${API_BASE}/testhome/chores`,
			{
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: "Wash dishes",
				}),
			}
		);
	});

	expect(await screen.findByText("Wash dishes")).toBeInTheDocument();
});

test("does not submit chore if the input is blank", async () => {
	globalThis.fetch = vi.fn().mockResolvedValueOnce({
		ok: true,
		json: async () => [],
	}) as unknown as typeof fetch;

	renderChorePageWithHistory();

	await screen.findByText("No Chores");
	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "+" }));
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
					_id: "chore-1",
					title: "Take out trash",
					homeId: "home-1",
				},
			],
		})
		.mockResolvedValueOnce({
			ok: true,
			json: async () => ({}),
		}) as unknown as typeof fetch;

	renderChorePageWithHistory();

	expect(await screen.findByText("Take out trash")).toBeInTheDocument();
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
			`${API_BASE}/testhome/chores/chore-1`,
			{
				method: "DELETE",
				credentials: "include",
			}
		);
	});
});
