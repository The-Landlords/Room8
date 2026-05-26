import * as React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import CalendarPage from "../pages/calendarPage";

type CalendarEvent = {
	_id?: string;
	title: string;
	description?: string;
	start?: string;
	end?: string;
	location?: string;
};

function renderCalendarPage() {
	return render(
		<MemoryRouter initialEntries={["/calendar/testuser/testhome"]}>
			<Routes>
				<Route
					path="/calendar/:username/:homeCode"
					element={<CalendarPage />}
				/>
			</Routes>
		</MemoryRouter>
	);
}

function mockFetchWithEvents(events: CalendarEvent[]) {
	globalThis.fetch = vi
		.fn()
		.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ _id: "home-1", homeName: "Test Home" }),
		})
		.mockResolvedValueOnce({
			ok: true,
			json: async () => events,
		}) as unknown as typeof fetch;
}

beforeEach(() => {
	mockFetchWithEvents([]);
});

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

test("renders the real calendar page empty state", async () => {
	renderCalendarPage();

	expect(await screen.findByText("Events for Test Home")).toBeInTheDocument();

	expect(
		await screen.findByText("No Events available! Click below to add.")
	).toBeInTheDocument();

	expect(screen.getByRole("button", { name: "+" })).toBeInTheDocument();
});

test("clicking the real add button opens the add event overlay", async () => {
	renderCalendarPage();

	await screen.findByText("Events for Test Home");
	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "+" }));

	expect(
		screen.getByRole("heading", { name: "Add Event" })
	).toBeInTheDocument();
});

test("shows upcoming and past sections when events are fetched", async () => {
	mockFetchWithEvents([
		{
			_id: "event-1",
			title: "Future Party",
			description: "Snacks",
			start: "2099-06-01T18:00:00.000Z",
			end: "2099-06-01T20:00:00.000Z",
			location: "Clubhouse",
		},
		{
			_id: "event-2",
			title: "Old Meeting",
			description: "Notes",
			start: "2000-01-01T18:00:00.000Z",
			end: "2000-01-01T20:00:00.000Z",
			location: "Office",
		},
	]);

	renderCalendarPage();

	expect(await screen.findByText("Upcoming Events")).toBeInTheDocument();
	expect(screen.getByText("Past Events")).toBeInTheDocument();
	expect(screen.getByText("Future Party")).toBeInTheDocument();

	expect(screen.queryByText("Old Meeting")).not.toBeInTheDocument();
});

test("clicking past events shows the real past events list", async () => {
	mockFetchWithEvents([
		{
			_id: "event-1",
			title: "Future Party",
			description: "Snacks",
			start: "2099-06-01T18:00:00.000Z",
			end: "2099-06-01T20:00:00.000Z",
			location: "Clubhouse",
		},
		{
			_id: "event-2",
			title: "Old Meeting",
			description: "Notes",
			start: "2000-01-01T18:00:00.000Z",
			end: "2000-01-01T20:00:00.000Z",
			location: "Office",
		},
	]);

	renderCalendarPage();

	expect(await screen.findByText("Future Party")).toBeInTheDocument();
	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: /Past Events/i }));

	expect(screen.getByText("Old Meeting")).toBeInTheDocument();
});

test("clicking remove mode shows the real remove controls", async () => {
	mockFetchWithEvents([
		{
			_id: "event-1",
			title: "Future Party",
			description: "Snacks",
			start: "2099-06-01T18:00:00.000Z",
			end: "2099-06-01T20:00:00.000Z",
			location: "Clubhouse",
		},
	]);

	renderCalendarPage();

	expect(await screen.findByText("Future Party")).toBeInTheDocument();
	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "-" }));

	expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
});

test("clicking the real trash button sends a DELETE request", async () => {
	mockFetchWithEvents([
		{
			_id: "event-1",
			title: "Future Party",
			description: "Snacks",
			start: "2099-06-01T18:00:00.000Z",
			end: "2099-06-01T20:00:00.000Z",
			location: "Clubhouse",
		},
	]);

	const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
	fetchMock.mockResolvedValueOnce({
		ok: true,
		json: async () => ({}),
	});

	renderCalendarPage();

	expect(await screen.findByText("Future Party")).toBeInTheDocument();
	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "-" }));

	const trashButton = screen
		.getAllByRole("button")
		.find((button) => button.querySelector("svg[data-icon='trash-can']"));

	expect(trashButton).toBeDefined();

	await user.click(trashButton as HTMLButtonElement);

	expect(
		screen.getByText("Are you sure you want to remove ", {
			exact: false,
		})
	).toBeInTheDocument();

	await user.click(screen.getByRole("button", { name: "Remove" }));

	await waitFor(() => {
		expect(globalThis.fetch).toHaveBeenCalledTimes(3);
	});
});
