import * as React from "react";
import {
	cleanup,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import CalendarPage from "../pages/calendarPage";
import { API_BASE } from "../config";

type EventItem = {
	_id: string;
	title: string;
	description: string;
	start: string;
	end: string;
	location: string;
};

function renderCalendarPage() {
	return render(
		<MemoryRouter
			initialEntries={[
				"/home/testuser/testhome",
				"/testuser/testhome/calendar",
			]}
			initialIndex={1}
		>
			<Routes>
				<Route
					path="/home/:username/:homeCode"
					element={<div>Home Page</div>}
				/>
				<Route
					path="/:username/:homeCode/calendar"
					element={<CalendarPage />}
				/>
			</Routes>
		</MemoryRouter>
	);
}

function jsonResponse(data: unknown) {
	return {
		ok: true,
		json: async () => data,
	} as Response;
}

function makeFutureEvent(overrides: Partial<EventItem> = {}): EventItem {
	return {
		_id: "event-future-1",
		title: "Future Party",
		description: "A future event",
		start: "2099-01-01T18:00:00.000Z",
		end: "2099-01-01T20:00:00.000Z",
		location: "Kitchen",
		...overrides,
	};
}

function makePastEvent(overrides: Partial<EventItem> = {}): EventItem {
	return {
		_id: "event-past-1",
		title: "Past Party",
		description: "A past event",
		start: "2000-01-01T18:00:00.000Z",
		end: "2000-01-01T20:00:00.000Z",
		location: "Living Room",
		...overrides,
	};
}

function mockCalendarFetch(events: EventItem[] = []) {
	globalThis.fetch = vi.fn(async (input, init) => {
		const url = String(input);
		const method = init?.method ?? "GET";

		// Used by Header and also by CalendarPage.fetchEvents.
		if (url === `${API_BASE}/homes/code/testhome` && method === "GET") {
			return jsonResponse({
				_id: "home-1",
				homeName: "Test Home",
			});
		}

		// Used by CalendarPage.fetchEvents after home lookup.
		if (url === `${API_BASE}/homeId/home-1/events/` && method === "GET") {
			return jsonResponse(events);
		}

		throw new Error(`Unhandled fetch: ${method} ${url}`);
	}) as unknown as typeof fetch;
}

function getTrashButton() {
	const trashButton = screen
		.getAllByRole("button")
		.find((button) => button.querySelector("svg[data-icon='trash-can']"));

	expect(trashButton).toBeDefined();

	return trashButton as HTMLButtonElement;
}

function getEditButton() {
	const editButton = screen
		.getAllByRole("button")
		.find((button) =>
			button.querySelector("svg[data-icon='pen-to-square']")
		);

	expect(editButton).toBeDefined();

	return editButton as HTMLButtonElement;
}

beforeEach(() => {
	mockCalendarFetch([]);
});

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

test("renders empty event state", async () => {
	mockCalendarFetch([]);

	renderCalendarPage();

	expect(await screen.findByText("No Events")).toBeInTheDocument();

	expect(globalThis.fetch).toHaveBeenCalledWith(
		`${API_BASE}/homes/code/testhome`,
		{
			credentials: "include",
		}
	);

	expect(globalThis.fetch).toHaveBeenCalledWith(
		`${API_BASE}/homeId/home-1/events/`,
		{
			credentials: "include",
		}
	);
});

test("renders upcoming events fetched from backend", async () => {
	mockCalendarFetch([makeFutureEvent()]);

	renderCalendarPage();

	expect(await screen.findByText("Upcoming Events")).toBeInTheDocument();
	expect(screen.getByText("Future Party")).toBeInTheDocument();
	expect(screen.getByText("A future event")).toBeInTheDocument();
	expect(screen.getByText("Kitchen")).toBeInTheDocument();
	expect(screen.queryByText("Past Events")).not.toBeInTheDocument();
});

test("renders upcoming and past section headers when both exist", async () => {
	mockCalendarFetch([makeFutureEvent(), makePastEvent()]);

	renderCalendarPage();

	expect(await screen.findByText("Upcoming Events")).toBeInTheDocument();
	expect(screen.getByText("Past Events")).toBeInTheDocument();

	expect(screen.getByText("Future Party")).toBeInTheDocument();

	// Past events are hidden by default.
	expect(screen.queryByText("Past Party")).not.toBeInTheDocument();
});

test("clicking past events shows the real past events list", async () => {
	mockCalendarFetch([makeFutureEvent(), makePastEvent()]);

	renderCalendarPage();

	expect(await screen.findByText("Future Party")).toBeInTheDocument();

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: /past events/i }));

	expect(screen.getByText("Past Party")).toBeInTheDocument();
	expect(screen.getByText("A past event")).toBeInTheDocument();
	expect(screen.getByText("Living Room")).toBeInTheDocument();
});

test("clicking upcoming events collapses the upcoming events list", async () => {
	mockCalendarFetch([makeFutureEvent(), makePastEvent()]);

	renderCalendarPage();

	expect(await screen.findByText("Future Party")).toBeInTheDocument();

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: /upcoming events/i }));

	expect(screen.queryByText("Future Party")).not.toBeInTheDocument();
});

test("clicking the add button opens the real add event overlay", async () => {
	mockCalendarFetch([]);

	renderCalendarPage();

	await screen.findByText("No Events");

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "+" }));

	expect(
		screen.getByRole("heading", { name: /add event/i })
	).toBeInTheDocument();
});

test("clicking remove mode shows the real remove controls", async () => {
	mockCalendarFetch([makeFutureEvent()]);

	renderCalendarPage();

	expect(await screen.findByText("Future Party")).toBeInTheDocument();

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "-" }));

	expect(getTrashButton()).toBeInTheDocument();
});

test("clicking the real trash button opens the remove event overlay", async () => {
	mockCalendarFetch([makeFutureEvent()]);

	renderCalendarPage();

	expect(await screen.findByText("Future Party")).toBeInTheDocument();

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "-" }));
	await user.click(getTrashButton());

	expect(
		screen.getByRole("heading", {
			name: /are you sure you want to remove future party/i,
		})
	).toBeInTheDocument();
});

test("cancel closes the remove event overlay", async () => {
	mockCalendarFetch([makeFutureEvent()]);

	renderCalendarPage();

	expect(await screen.findByText("Future Party")).toBeInTheDocument();

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "-" }));
	await user.click(getTrashButton());

	const removeHeading = screen.getByRole("heading", {
		name: /are you sure you want to remove future party/i,
	});

	const overlay = removeHeading.closest(".overlay-content");
	expect(overlay).not.toBeNull();

	await user.click(
		within(overlay as HTMLElement).getByRole("button", {
			name: /cancel/i,
		})
	);

	expect(
		screen.queryByRole("heading", {
			name: /are you sure you want to remove future party/i,
		})
	).not.toBeInTheDocument();
});

test("clicking edit mode shows the real edit controls if EventList renders edit buttons", async () => {
	mockCalendarFetch([makeFutureEvent()]);

	renderCalendarPage();

	expect(await screen.findByText("Future Party")).toBeInTheDocument();

	expect(getEditButton()).toBeInTheDocument();
});
