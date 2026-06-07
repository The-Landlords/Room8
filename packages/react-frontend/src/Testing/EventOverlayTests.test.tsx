import * as React from "react";
import {
	cleanup,
	render,
	screen,
	waitFor,
	fireEvent,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { API_BASE } from "../config";
import AddEventOverlay from "../components/addEventOverlay";
import EditEventOverlay from "../components/EditEventOverlay";
import RemoveEventOverlay from "../components/removeEventOverlay";
import userEvent from "@testing-library/user-event";

function renderAddEventOverlay() {
	const onAdd = vi.fn();
	const onCancel = vi.fn();

	const result = render(
		<AddEventOverlay
			homeCode="testhome"
			username="testuser"
			onAdd={onAdd}
			onCancel={onCancel}
		/>
	);
	return {
		...result,
		user: userEvent.setup(),
		onAdd,
		onCancel,
	};
}

// from calendarPage.test.tsx
type EventItem = {
	_id: string;
	title: string;
	description: string;
	start: string;
	end: string;
	location: string;
};

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

beforeEach(() => {
	globalThis.fetch = vi.fn() as unknown as typeof fetch;
});

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

test("renders add event overlay", () => {
	const { container } = renderAddEventOverlay();

	expect(
		screen.getByRole("heading", { name: /add event/i })
	).toBeInTheDocument();

	expect(screen.getByPlaceholderText(/title/i)).toBeInTheDocument();
	expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument();
	expect(screen.getByPlaceholderText(/location/i)).toBeInTheDocument();

	expect(
		container.querySelectorAll("input[type='datetime-local']")
	).toHaveLength(2);

	expect(
		screen.getByRole("button", { name: /add event/i })
	).toBeInTheDocument();
});

test("shows validation error when required fields are empty", async () => {
	const { user } = renderAddEventOverlay();

	await user.click(screen.getByRole("button", { name: /add event/i }));

	expect(
		await screen.findByText(/all fields must be filled out/i)
	).toBeInTheDocument();

	expect(globalThis.fetch).not.toHaveBeenCalled();
});

test("submits a new event", async () => {
	const createdEvent = {
		_id: "event-1",
		title: "Roommate Dinner",
		description: "Pizza night",
		start: "2099-01-01T18:00",
		end: "2099-01-01T19:00",
		location: "Kitchen",
	};

	const fetchMock = vi.fn().mockResolvedValue({
		ok: true,
		json: async () => createdEvent,
	});

	globalThis.fetch = fetchMock as unknown as typeof fetch;

	const { container, user, onAdd } = renderAddEventOverlay();

	await user.type(screen.getByPlaceholderText(/title/i), "Roommate Dinner");
	await user.type(screen.getByPlaceholderText(/description/i), "Pizza night");
	await user.type(screen.getByPlaceholderText(/location/i), "Kitchen");

	const [startInput, endInput] = container.querySelectorAll<HTMLInputElement>(
		"input[type='datetime-local']"
	);

	fireEvent.change(startInput, { target: { value: "2099-01-01T18:00" } });
	fireEvent.change(endInput, { target: { value: "2099-01-01T19:00" } });

	await user.click(screen.getByRole("button", { name: /add event/i }));

	await waitFor(() => {
		expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/testhome/events`, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				title: "Roommate Dinner",
				start: "2099-01-01T18:00",
				end: "2099-01-01T19:00",
				location: "Kitchen",
				username: "testuser",
				description: "Pizza night",
			}),
		});
	});

	expect(onAdd).toHaveBeenCalledWith(createdEvent);
});

test("alerts and skips add event when start is not before end", async () => {
	const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
	const { container, user, onAdd } = renderAddEventOverlay();

	await user.type(screen.getByPlaceholderText(/title/i), "Roommate Dinner");
	await user.type(screen.getByPlaceholderText(/description/i), "Pizza night");
	await user.type(screen.getByPlaceholderText(/location/i), "Kitchen");

	const [startInput, endInput] = container.querySelectorAll<HTMLInputElement>(
		"input[type='datetime-local']"
	);

	fireEvent.change(startInput, { target: { value: "2099-01-01T20:00" } });
	fireEvent.change(endInput, { target: { value: "2099-01-01T19:00" } });

	await user.click(screen.getByRole("button", { name: /add event/i }));

	expect(alertSpy).toHaveBeenCalledWith(
		"Start time must be before end time."
	);
	expect(globalThis.fetch).not.toHaveBeenCalled();
	expect(onAdd).not.toHaveBeenCalled();

	alertSpy.mockRestore();
});

function renderRemoveEventOverlay(eventRemove = makeFutureEvent()) {
	const onRemove = vi.fn();
	const onCancel = vi.fn();

	const result = render(
		<RemoveEventOverlay
			eventRemove={eventRemove}
			onRemove={onRemove}
			onCancel={onCancel}
		/>
	);

	return {
		...result,
		user: userEvent.setup(),
		onRemove,
		onCancel,
		eventRemove,
	};
}

beforeEach(() => {
	globalThis.fetch = vi.fn() as unknown as typeof fetch;
});

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

test("renders remove event dialog", () => {
	renderRemoveEventOverlay();

	expect(
		screen.getByRole("heading", {
			name: /are you sure you want to remove future party/i,
		})
	).toBeInTheDocument();

	expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
	expect(screen.getByRole("button", { name: /remove/i })).toBeInTheDocument();
});

test("clicking cancel calls onCancel", async () => {
	const { user, onCancel } = renderRemoveEventOverlay();

	await user.click(screen.getByRole("button", { name: /cancel/i }));

	expect(onCancel).toHaveBeenCalledTimes(1);
});

test("clicking remove deletes the event and calls onRemove", async () => {
	const fetchMock = vi.fn().mockResolvedValue({
		ok: true,
		status: 204,
	});

	globalThis.fetch = fetchMock as unknown as typeof fetch;

	const { user, onRemove, eventRemove } = renderRemoveEventOverlay();

	await user.click(screen.getByRole("button", { name: /remove/i }));

	await waitFor(() => {
		expect(fetchMock).toHaveBeenCalledWith(
			`${API_BASE}/events/event-future-1`,
			{
				method: "DELETE",
				credentials: "include",
			}
		);
	});

	expect(onRemove).toHaveBeenCalledWith(eventRemove);
});

test("does not call onRemove when delete fails", async () => {
	// mock server error response
	const fetchMock = vi.fn().mockResolvedValue({
		ok: false,
		status: 500,
		text: async () => "Server error",
	});

	globalThis.fetch = fetchMock as unknown as typeof fetch;

	const { user, onRemove } = renderRemoveEventOverlay();

	await user.click(screen.getByRole("button", { name: /remove/i }));

	await waitFor(() => {
		expect(fetchMock).toHaveBeenCalled();
	});

	expect(onRemove).not.toHaveBeenCalled();
});

test("does not fetch when event id is missing", async () => {
	const { user, onRemove } = renderRemoveEventOverlay(
		makeFutureEvent({ _id: "" })
	);

	await user.click(screen.getByRole("button", { name: /remove/i }));

	expect(globalThis.fetch).not.toHaveBeenCalled();
	expect(onRemove).not.toHaveBeenCalled();
});

test("renders existing event values", () => {
	const eventEdit = {
		_id: "event-1",
		title: "Old Dinner",
		description: "Old description",
		start: "2099-01-01T18:00:00.000Z",
		end: "2099-01-01T19:00:00.000Z",
		location: "Kitchen",
		status: "pending",
	};

	render(
		<EditEventOverlay
			eventEdit={eventEdit}
			onEdit={vi.fn()}
			onCancel={vi.fn()}
		/>
	);

	expect(
		screen.getByRole("heading", { name: /edit event/i })
	).toBeInTheDocument();

	expect(screen.getByDisplayValue("Old Dinner")).toBeInTheDocument();
	expect(screen.getByDisplayValue("Old description")).toBeInTheDocument();
	expect(screen.getByDisplayValue("Kitchen")).toBeInTheDocument();
});

test("renders edit overlay defaults when event fields are missing", () => {
	const { container } = render(
		<EditEventOverlay
			eventEdit={{
				_id: "event-1",
				start: "not-a-date",
			}}
			onEdit={vi.fn()}
			onCancel={vi.fn()}
		/>
	);

	expect(screen.getByPlaceholderText(/title/i)).toHaveValue("");
	expect(screen.getByPlaceholderText(/description/i)).toHaveValue("");
	expect(screen.getByPlaceholderText(/location/i)).toHaveValue("");
	expect(screen.getByRole("combobox")).toHaveValue("");

	const [startInput, endInput] = container.querySelectorAll<HTMLInputElement>(
		"input[type='datetime-local']"
	);

	expect(startInput).toHaveValue("");
	expect(endInput).toHaveValue("");
});

test("submits edited event with PATCH request", async () => {
	const updatedEvent = {
		_id: "event-1",
		title: "New Dinner",
		description: "Updated description",
		start: "2099-01-01T20:00",
		end: "2099-01-01T21:00",
		location: "Living Room",
		status: "confirmed",
	};

	const fetchMock = vi.fn().mockResolvedValue({
		ok: true,
		json: async () => updatedEvent,
	});

	globalThis.fetch = fetchMock as unknown as typeof fetch;

	const onEdit = vi.fn();
	const user = userEvent.setup();

	const { container } = render(
		<EditEventOverlay
			eventEdit={{
				_id: "event-1",
				title: "Old Dinner",
				description: "Old description",
				start: "2099-01-01T18:00:00.000Z",
				end: "2099-01-01T19:00:00.000Z",
				location: "Kitchen",
				status: "pending",
			}}
			onEdit={onEdit}
			onCancel={vi.fn()}
		/>
	);

	await user.clear(screen.getByPlaceholderText(/title/i));
	await user.type(screen.getByPlaceholderText(/title/i), "New Dinner");

	await user.clear(screen.getByPlaceholderText(/description/i));
	await user.type(
		screen.getByPlaceholderText(/description/i),
		"Updated description"
	);

	await user.clear(screen.getByPlaceholderText(/location/i));
	await user.type(screen.getByPlaceholderText(/location/i), "Living Room");

	const [startInput, endInput] = container.querySelectorAll<HTMLInputElement>(
		"input[type='datetime-local']"
	);

	fireEvent.change(startInput, { target: { value: "2099-01-01T20:00" } });
	fireEvent.change(endInput, { target: { value: "2099-01-01T21:00" } });

	const statusSelect = container.querySelector("select") as HTMLSelectElement;
	await user.selectOptions(statusSelect, "confirmed");

	await user.click(screen.getByRole("button", { name: /update event/i }));

	await waitFor(() => {
		expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/events/event-1`, {
			method: "PATCH",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				title: "New Dinner",
				start: "2099-01-01T20:00",
				end: "2099-01-01T21:00",
				location: "Living Room",
				description: "Updated description",
				status: "confirmed",
			}),
		});
	});

	expect(onEdit).toHaveBeenCalledWith(updatedEvent);
});

test("does not call onRemove when delete response is not ok", async () => {
	const consoleErrorSpy = vi
		.spyOn(console, "error")
		.mockImplementation(() => {});

	const fetchMock = vi.fn().mockResolvedValue({
		ok: false,
		status: 500,
		text: async () => "Server error",
	});

	globalThis.fetch = fetchMock as unknown as typeof fetch;

	const { user, onRemove } = renderRemoveEventOverlay();

	await user.click(screen.getByRole("button", { name: /remove/i }));

	await waitFor(() => {
		expect(fetchMock).toHaveBeenCalledWith(
			`${API_BASE}/events/event-future-1`,
			{
				method: "DELETE",
				credentials: "include",
			}
		);
	});

	expect(consoleErrorSpy).toHaveBeenCalledWith(
		"delete failed:",
		"Server error"
	);
	expect(consoleErrorSpy).toHaveBeenCalledWith(
		"Error removing event:",
		expect.any(Error)
	);

	expect(onRemove).not.toHaveBeenCalled();

	consoleErrorSpy.mockRestore();
});

test("does not call onEdit when edit request fails", async () => {
	const consoleErrorSpy = vi
		.spyOn(console, "error")
		.mockImplementation(() => {});
	const fetchMock = vi.fn().mockResolvedValue({
		ok: false,
		json: async () => ({}),
	});

	globalThis.fetch = fetchMock as unknown as typeof fetch;

	const onEdit = vi.fn();
	const user = userEvent.setup();

	render(
		<EditEventOverlay
			eventEdit={{
				_id: "event-1",
				title: "Old Dinner",
				description: "Old description",
				start: "2099-01-01T18:00:00.000Z",
				end: "2099-01-01T19:00:00.000Z",
				location: "Kitchen",
				status: "pending",
			}}
			onEdit={onEdit}
			onCancel={vi.fn()}
		/>
	);

	await user.click(screen.getByRole("button", { name: /update event/i }));

	await waitFor(() => {
		expect(fetchMock).toHaveBeenCalled();
	});

	expect(onEdit).not.toHaveBeenCalled();
	expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to edit event");

	consoleErrorSpy.mockRestore();
});

test("does not edit when event id is missing", async () => {
	const consoleErrorSpy = vi
		.spyOn(console, "error")
		.mockImplementation(() => {});
	const user = userEvent.setup();
	const eventEdit = {
		title: "Old Dinner",
		description: "Old description",
		start: "2099-01-01T18:00:00.000Z",
		end: "2099-01-01T19:00:00.000Z",
		location: "Kitchen",
		status: "pending",
	};

	render(
		<EditEventOverlay
			eventEdit={eventEdit}
			onEdit={vi.fn()}
			onCancel={vi.fn()}
		/>
	);

	await user.click(screen.getByRole("button", { name: /update event/i }));

	expect(consoleErrorSpy).toHaveBeenCalledWith("Missing event id", eventEdit);
	expect(globalThis.fetch).not.toHaveBeenCalled();

	consoleErrorSpy.mockRestore();
});
