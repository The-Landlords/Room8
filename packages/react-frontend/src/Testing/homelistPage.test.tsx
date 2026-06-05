import * as React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import HomeList from "../pages/homelistPage";

type Home = {
	_id?: string;
	homeName: string;
	address?: string;
	homeCode?: string;
};

function renderHomeList() {
	return render(
		<MemoryRouter initialEntries={["/homes/testuser"]}>
			<Routes>
				<Route path="/homes/:username" element={<HomeList />} />
			</Routes>
		</MemoryRouter>
	);
}

function mockFetchWithHomes(homes: Home[]) {
	globalThis.fetch = vi.fn().mockResolvedValueOnce({
		ok: true,
		json: async () => homes,
	}) as unknown as typeof fetch;
}

beforeEach(() => {
	mockFetchWithHomes([]);
});

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

test("renders empty home state", async () => {
	renderHomeList();

	expect(await screen.findByText("Home Spaces")).toBeInTheDocument();
	expect(await screen.findByText("No Home Spaces")).toBeInTheDocument();
	expect(screen.getByRole("button", { name: "+" })).toBeInTheDocument();
});

test("renders homes fetched from backend", async () => {
	mockFetchWithHomes([
		{
			_id: "home-1",
			homeName: "Apartment",
			address: "123 Main St",
			homeCode: "ABC123",
		},
	]);

	renderHomeList();

	expect(await screen.findByText("Apartment")).toBeInTheDocument();
	expect(screen.getByText("123 Main St")).toBeInTheDocument();
});

test("clicking add opens the real home add options overlay", async () => {
	renderHomeList();

	await screen.findByText("No Home Spaces");

	const user = userEvent.setup();
	await user.click(screen.getByRole("button", { name: "+" }));

	await waitFor(() => {
		expect(document.querySelector(".overlay-backdrop")).toBeInTheDocument();
	});
});

test("clicking remove opens the real remove home overlay", async () => {
	mockFetchWithHomes([
		{
			_id: "home-1",
			homeName: "Apartment",
			address: "123 Main St",
			homeCode: "ABC123",
		},
	]);

	renderHomeList();

	expect(await screen.findByText("Apartment")).toBeInTheDocument();

	const user = userEvent.setup();
	await user.click(screen.getByRole("button", { name: "-" }));

	const trashButton = screen
		.getAllByRole("button")
		.find((button) => button.querySelector("svg[data-icon='trash-can']"));

	expect(trashButton).toBeDefined();
	await user.click(trashButton as HTMLButtonElement);

	await waitFor(() => {
		expect(document.querySelector(".overlay-backdrop")).toBeInTheDocument();
	});
});
