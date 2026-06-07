import * as React from "react";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

vi.mock("ol/source/OSM", () => ({
	default: vi.fn(function MockOSM() {}),
}));

vi.mock("ol/layer/Tile", () => ({
	default: vi.fn(function MockTileLayer() {}),
}));

vi.mock("ol/layer/Vector", () => ({
	default: vi.fn(function MockVectorLayer() {}),
}));

vi.mock("ol/source/Vector", () => ({
	default: vi.fn(function MockVectorSource() {
		return {
			clear: vi.fn(),
			addFeature: vi.fn(),
		};
	}),
}));

vi.mock("ol/Feature", () => ({
	default: vi.fn(function MockFeature() {
		return {
			setStyle: vi.fn(),
		};
	}),
}));

vi.mock("ol/geom/Point", () => ({
	default: vi.fn(function MockPoint() {}),
}));

vi.mock("ol/style", () => ({
	Icon: vi.fn(function MockIcon() {}),
	Style: vi.fn(function MockStyle() {}),
}));

vi.mock("ol/proj", () => ({
	fromLonLat: vi.fn((coords) => coords),
}));

vi.mock("ol/control", () => ({
	defaults: vi.fn(() => ({})),
}));

vi.mock("ol/control/Zoom", () => ({
	default: vi.fn(function MockZoom() {}),
}));

vi.mock("ol", () => ({
	Map: vi.fn(function MockMap() {
		return {
			addControl: vi.fn(),
			removeControl: vi.fn(),
			setTarget: vi.fn(),
			getView: () => ({
				animate: vi.fn(),
			}),
		};
	}),
	View: vi.fn(function MockView() {}),
}));

import AddHomeOverlay from "../components/addHomeOverlay";
import RemoveHomeOverlay from "../components/removeHomeOverlay";
import CreateHomeOverlay from "../components/createHomeOverlay";
import { API_BASE } from "../config";

beforeEach(() => {
	Object.defineProperty(global.navigator, "geolocation", {
		configurable: true,
		value: {
			getCurrentPosition: vi.fn((success) =>
				success({ coords: { longitude: -120.65, latitude: 35.28 } })
			),
		},
	});

	globalThis.fetch = vi.fn() as unknown as typeof fetch;
});

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

test("AddHomeOverlay posts relation and calls onAdd", async () => {
	const addedHome = {
		_id: "home-1",
		homeCode: "ABCD123",
		homeName: "Apartment",
	};
	const fetchMock = vi
		.fn()
		.mockResolvedValue({ json: async () => addedHome });
	globalThis.fetch = fetchMock as unknown as typeof fetch;

	const onAdd = vi.fn();
	const user = userEvent.setup();

	render(<AddHomeOverlay onBack={vi.fn()} onAdd={onAdd} />);

	await user.type(screen.getByPlaceholderText(/home id/i), "ABCD123");
	await user.click(screen.getByRole("button", { name: /add home/i }));

	await waitFor(() => expect(onAdd).toHaveBeenCalledWith(addedHome));

	expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/relate/me/ABCD123`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ relationship: "GUEST" }),
	});
});

test("AddHomeOverlay validates empty home code", async () => {
	const user = userEvent.setup();

	render(<AddHomeOverlay onBack={vi.fn()} onAdd={vi.fn()} />);

	await user.click(screen.getByRole("button", { name: /add home/i }));

	expect(
		await screen.findByText(/home code cannot be empty/i)
	).toBeInTheDocument();
	expect(globalThis.fetch).not.toHaveBeenCalled();
});

test("RemoveHomeOverlay removes a home", async () => {
	const home = { _id: "home-1", homeCode: "HOME123", homeName: "Apartment" };
	const fetchMock = vi.fn().mockResolvedValue({
		ok: true,
		status: 200,
		json: async () => home,
	});
	globalThis.fetch = fetchMock as unknown as typeof fetch;

	const onRemove = vi.fn();
	const user = userEvent.setup();

	render(
		<RemoveHomeOverlay
			homeRemove={home}
			onRemove={onRemove}
			onCancel={vi.fn()}
		/>
	);

	await user.click(screen.getByRole("button", { name: /remove/i }));

	await waitFor(() => expect(onRemove).toHaveBeenCalledWith(home));

	expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/relate/me/HOME123`, {
		method: "PATCH",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ confirmDeleteHome: false }),
	});
});

test("RemoveHomeOverlay asks again when leaving deletes the home", async () => {
	const home = { _id: "home-1", homeCode: "HOME123", homeName: "Apartment" };
	const fetchMock = vi
		.fn()
		.mockResolvedValueOnce({
			ok: false,
			status: 409,
			json: async () => ({ willDeleteHome: true }),
		})
		.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => home,
		});

	globalThis.fetch = fetchMock as unknown as typeof fetch;

	const onRemove = vi.fn();
	const user = userEvent.setup();

	render(
		<RemoveHomeOverlay
			homeRemove={home}
			onRemove={onRemove}
			onCancel={vi.fn()}
		/>
	);

	await user.click(screen.getByRole("button", { name: /remove/i }));

	expect(
		await screen.findByText(/last member of apartment/i)
	).toBeInTheDocument();

	await user.click(screen.getByRole("button", { name: /remove/i }));

	await waitFor(() => expect(onRemove).toHaveBeenCalledWith(home));

	expect(fetchMock).toHaveBeenNthCalledWith(
		2,
		`${API_BASE}/relate/me/HOME123`,
		{
			method: "PATCH",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ confirmDeleteHome: true }),
		}
	);
});

test("CreateHomeOverlay validates missing fields", async () => {
	const user = userEvent.setup();

	render(<CreateHomeOverlay onBack={vi.fn()} onAdd={vi.fn()} />);

	await user.click(screen.getByRole("button", { name: /create home/i }));

	expect(
		await screen.findByText(/all fields must be correctly filled out/i)
	).toBeInTheDocument();
});

test("CreateHomeOverlay geocodes, creates home, relates user, and calls onAdd", async () => {
	const createdHome = {
		_id: "home-1",
		homeName: "Apartment",
		address: "123 Main St",
	};

	const fetchMock = vi.fn(async (input, init) => {
		const url = String(input);

		if (url.includes("nominatim.openstreetmap.org/search")) {
			return { json: async () => [{ lat: "35.28", lon: "-120.65" }] };
		}

		if (url === `${API_BASE}/homes` && init?.method === "POST") {
			return { json: async () => createdHome };
		}

		if (
			url.startsWith(`${API_BASE}/relate/me/`) &&
			init?.method === "POST"
		) {
			return { json: async () => ({ _id: "relation-1" }) };
		}

		throw new Error(`Unhandled fetch: ${url}`);
	});

	globalThis.fetch = fetchMock as unknown as typeof fetch;

	const onAdd = vi.fn();
	const user = userEvent.setup();

	render(<CreateHomeOverlay onBack={vi.fn()} onAdd={onAdd} />);

	fireEvent.change(screen.getByPlaceholderText(/home name/i), {
		target: { value: "Apartment" },
	});
	fireEvent.blur(screen.getByPlaceholderText(/street/i), {
		target: { value: "123 Main St" },
	});
	fireEvent.blur(screen.getByPlaceholderText(/city/i), {
		target: { value: "San Luis Obispo" },
	});
	fireEvent.blur(screen.getByPlaceholderText(/state/i), {
		target: { value: "CA" },
	});
	fireEvent.blur(screen.getByPlaceholderText(/postal code/i), {
		target: { value: "93401" },
	});

	await waitFor(() =>
		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining("nominatim.openstreetmap.org/search")
		)
	);

	await user.click(screen.getByRole("button", { name: /create home/i }));

	await waitFor(() => expect(onAdd).toHaveBeenCalledWith(createdHome));

	const createCall = fetchMock.mock.calls.find(
		([url]) => url === `${API_BASE}/homes`
	);

	expect(createCall).toBeDefined();

	const body = JSON.parse((createCall?.[1] as RequestInit).body as string);

	expect(body).toMatchObject({
		homeName: "Apartment",
		address: "123 Main St, San Luis Obispo, CA, 93401",
	});
	expect(body.homeCode).toMatch(/^[A-Za-z0-9]{6}$/);
});
