import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";
import CalendarPage from "../pages/calendarPage";

jest.mock("../components/list", () => {
	return function MockList(props: any) {
		return (
			<div>
				<button onClick={props.handleAddClick}>+</button>

				{props.items.map((item: any, index: number) => {
					const label = typeof item === "string" ? item : item.title;
					const key =
						typeof item === "string"
							? item
							: (item._id ?? `${label}-${index}`);

					return (
						<div key={key}>
							<div>{props.renderItem(item)}</div>

							{typeof item !== "string" && item._id && (
								<>
									<button
										onClick={() =>
											props.handleRemoveClick(item)
										}
									>
										remove {label}
									</button>

									<button
										onClick={() =>
											props.handleEditClick?.(item)
										}
									>
										edit {label}
									</button>
								</>
							)}
						</div>
					);
				})}
			</div>
		);
	};
});

jest.mock("../components/addEventOverlay", () => {
	return function MockAddEventOverlay(props: any) {
		return (
			<div>
				<div>Add Event</div>

				<button
					onClick={() =>
						props.onAdd({
							_id: "event-3",
							title: "Game Night",
							description: "Board games",
							start: "2099-06-01T18:00:00.000Z",
							end: "2099-06-01T20:00:00.000Z",
							location: "Living Room",
						})
					}
				>
					confirm add
				</button>

				<button onClick={props.onCancel}>cancel add</button>
			</div>
		);
	};
});

jest.mock("../components/removeEventOverlay", () => {
	return function MockRemoveEventOverlay(props: any) {
		return (
			<div>
				<div>Remove Event</div>

				<button onClick={() => props.onRemove(props.eventRemove)}>
					confirm remove
				</button>

				<button onClick={props.onCancel}>cancel remove</button>
			</div>
		);
	};
});

jest.mock("../components/EditEventOverlay", () => {
	return function MockEditEventOverlay(props: any) {
		return (
			<div>
				<div>Edit Event</div>

				<button
					onClick={() =>
						props.onEdit({
							...props.eventEdit,
							title: "Updated Party",
						})
					}
				>
					confirm edit
				</button>

				<button onClick={props.onCancel}>cancel edit</button>
			</div>
		);
	};
});

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

async function flushPromises() {
	await Promise.resolve();
	await Promise.resolve();
	await Promise.resolve();
}

async function renderLoadedCalendarPage() {
	renderCalendarPage();

	await act(async () => {
		await flushPromises();
	});
}

function mockFetchWithEvents(events: any[]) {
	globalThis.fetch = jest
		.fn()
		.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ _id: "home-1", homeName: "Test Home" }),
		})
		.mockResolvedValueOnce({
			ok: true,
			json: async () => events,
		});
}

beforeEach(() => {
	mockFetchWithEvents([]);
});

afterEach(() => {
	jest.clearAllMocks();
});

test("renders the calendar page empty state", async () => {
	await renderLoadedCalendarPage();

	expect(screen.getByText("Events for Test Home")).toBeInTheDocument();

	expect(
		screen.getByText("No Events available! Click below to add.")
	).toBeInTheDocument();

	expect(screen.getByRole("button", { name: "+" })).toBeInTheDocument();
});

test("clicking add opens the add event overlay", async () => {
	await renderLoadedCalendarPage();

	fireEvent.click(screen.getByRole("button", { name: "+" }));

	expect(screen.getByText("Add Event")).toBeInTheDocument();
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

	await renderLoadedCalendarPage();

	expect(screen.getByText("Upcoming Events")).toBeInTheDocument();
	expect(screen.getByText("Past Events")).toBeInTheDocument();
	expect(screen.getByText("Future Party")).toBeInTheDocument();

	expect(screen.queryByText("Old Meeting")).not.toBeInTheDocument();
});

test("clicking past events shows past events list", async () => {
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

	await renderLoadedCalendarPage();

	fireEvent.click(screen.getByRole("button", { name: /Past Events/i }));

	expect(screen.getByText("Old Meeting")).toBeInTheDocument();
});

test("confirming add appends a new event", async () => {
	await renderLoadedCalendarPage();

	fireEvent.click(screen.getByRole("button", { name: "+" }));

	await act(async () => {
		fireEvent.click(screen.getByRole("button", { name: "confirm add" }));
		await flushPromises();
	});

	expect(screen.getByText("Game Night")).toBeInTheDocument();

	expect(
		screen.queryByText("No Events available! Click below to add.")
	).not.toBeInTheDocument();
});

test("confirming remove deletes an event", async () => {
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

	await renderLoadedCalendarPage();

	expect(screen.getByText("Future Party")).toBeInTheDocument();

	fireEvent.click(
		screen.getByRole("button", { name: "remove Future Party" })
	);

	expect(screen.getByText("Remove Event")).toBeInTheDocument();

	await act(async () => {
		fireEvent.click(screen.getByRole("button", { name: "confirm remove" }));
		await flushPromises();
	});

	expect(screen.queryByText("Future Party")).not.toBeInTheDocument();

	expect(
		screen.getByText("No Events available! Click below to add.")
	).toBeInTheDocument();
});

test("confirming edit updates an event", async () => {
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

	await renderLoadedCalendarPage();

	expect(screen.getByText("Future Party")).toBeInTheDocument();

	fireEvent.click(screen.getByRole("button", { name: "edit Future Party" }));

	expect(screen.getByText("Edit Event")).toBeInTheDocument();

	await act(async () => {
		fireEvent.click(screen.getByRole("button", { name: "confirm edit" }));
		await flushPromises();
	});

	expect(screen.getByText("Updated Party")).toBeInTheDocument();
	expect(screen.queryByText("Future Party")).not.toBeInTheDocument();
});
