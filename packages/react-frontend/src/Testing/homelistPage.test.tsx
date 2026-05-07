import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";
import HomeList from "../pages/homelistPage";

// Mock List
jest.mock("../components/list", () => {
	return function MockList(props: any) {
		return (
			<div>
				<button onClick={props.handleAddClick}>+</button>

				{props.items.map((item: any, index: number) => {
					const label =
						typeof item === "string" ? item : item.homeName;

					const key =
						typeof item === "string"
							? item
							: (item._id ?? `${label}-${index}`);

					return (
						<div key={key}>
							<div>{props.renderItem(item)}</div>

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

// Mock HomeAddOverlay
jest.mock("../components/homeAddOverlay", () => {
	return function MockHomeAddOverlay(props: any) {
		return (
			<div>
				<div>Home Add Options</div>

				<button onClick={() => props.onPick("Add")}>pick add</button>

				<button onClick={() => props.onPick("Create")}>
					pick create
				</button>
			</div>
		);
	};
});

// Mock AddHomeOverlay
jest.mock("../components/addHomeOverlay", () => {
	return function MockAddHomeOverlay(props: any) {
		return (
			<div>
				<div>Add Home Overlay</div>

				<button
					onClick={() =>
						props.onAdd({
							_id: "home-2",
							homeName: "Joined Home",
							address: "456 Oak St",
							homeCode: "JOIN456",
						})
					}
				>
					confirm add home
				</button>
			</div>
		);
	};
});

// Mock CreateHomeOverlay so Jest does not load OpenLayers
jest.mock("../components/createHomeOverlay", () => {
	return function MockCreateHomeOverlay(props: any) {
		return (
			<div>
				<div>Create Home Overlay</div>

				<button
					onClick={() =>
						props.onAdd({
							_id: "home-3",
							homeName: "Created Home",
							address: "789 Pine St",
							homeCode: "CREATE789",
						})
					}
				>
					confirm create home
				</button>
			</div>
		);
	};
});

// Mock RemoveHomeOverlay
jest.mock("../components/removeHomeOverlay", () => {
	return function MockRemoveHomeOverlay(props: any) {
		return (
			<div>
				<div>Remove Home Overlay</div>

				<button onClick={() => props.onRemove(props.homeRemove)}>
					confirm remove home
				</button>

				<button onClick={props.onCancel}>cancel remove</button>
			</div>
		);
	};
});

function renderHomeList() {
	return render(
		<MemoryRouter initialEntries={["/homes/testuser"]}>
			<Routes>
				<Route path="/homes/:username" element={<HomeList />} />
			</Routes>
		</MemoryRouter>
	);
}

async function flushPromises() {
	await Promise.resolve();
	await Promise.resolve();
	await Promise.resolve();
}

async function renderLoadedHomeList() {
	renderHomeList();

	await act(async () => {
		await flushPromises();
	});
}

function mockFetchWithHomes(homes: any[]) {
	globalThis.fetch = jest.fn().mockResolvedValueOnce({
		ok: true,
		json: async () => homes,
	});
}

beforeEach(() => {
	mockFetchWithHomes([]);
});

afterEach(() => {
	jest.clearAllMocks();
});

test("renders empty home state", async () => {
	await renderLoadedHomeList();

	expect(screen.getByText("Home Spaces")).toBeInTheDocument();

	expect(
		screen.getByText("No Homes available! Click below to add.")
	).toBeInTheDocument();

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

	await renderLoadedHomeList();

	expect(screen.getByText("Apartment")).toBeInTheDocument();
	expect(screen.getByText("123 Main St")).toBeInTheDocument();
});

test("clicking add opens the home add options overlay", async () => {
	await renderLoadedHomeList();

	fireEvent.click(screen.getByRole("button", { name: "+" }));

	expect(screen.getByText("Home Add Options")).toBeInTheDocument();
	expect(
		screen.getByRole("button", { name: "pick add" })
	).toBeInTheDocument();
	expect(
		screen.getByRole("button", { name: "pick create" })
	).toBeInTheDocument();
});

test("choosing add opens the add home overlay", async () => {
	await renderLoadedHomeList();

	fireEvent.click(screen.getByRole("button", { name: "+" }));
	fireEvent.click(screen.getByRole("button", { name: "pick add" }));

	expect(screen.getByText("Add Home Overlay")).toBeInTheDocument();
});

test("confirming add appends a joined home", async () => {
	await renderLoadedHomeList();

	fireEvent.click(screen.getByRole("button", { name: "+" }));
	fireEvent.click(screen.getByRole("button", { name: "pick add" }));

	await act(async () => {
		fireEvent.click(
			screen.getByRole("button", { name: "confirm add home" })
		);
		await flushPromises();
	});

	expect(screen.getByText("Joined Home")).toBeInTheDocument();
	expect(screen.getByText("456 Oak St")).toBeInTheDocument();

	expect(
		screen.queryByText("No Homes available! Click below to add.")
	).not.toBeInTheDocument();
});

test("choosing create opens the create home overlay", async () => {
	await renderLoadedHomeList();

	fireEvent.click(screen.getByRole("button", { name: "+" }));
	fireEvent.click(screen.getByRole("button", { name: "pick create" }));

	expect(screen.getByText("Create Home Overlay")).toBeInTheDocument();
});

test("confirming create appends a created home", async () => {
	await renderLoadedHomeList();

	fireEvent.click(screen.getByRole("button", { name: "+" }));
	fireEvent.click(screen.getByRole("button", { name: "pick create" }));

	await act(async () => {
		fireEvent.click(
			screen.getByRole("button", { name: "confirm create home" })
		);
		await flushPromises();
	});

	expect(screen.getByText("Created Home")).toBeInTheDocument();
	expect(screen.getByText("789 Pine St")).toBeInTheDocument();

	expect(
		screen.queryByText("No Homes available! Click below to add.")
	).not.toBeInTheDocument();
});

test("confirming remove deletes a home", async () => {
	mockFetchWithHomes([
		{
			_id: "home-1",
			homeName: "Apartment",
			address: "123 Main St",
			homeCode: "ABC123",
		},
	]);

	await renderLoadedHomeList();

	expect(screen.getByText("Apartment")).toBeInTheDocument();

	fireEvent.click(screen.getByRole("button", { name: "remove Apartment" }));

	expect(screen.getByText("Remove Home Overlay")).toBeInTheDocument();

	await act(async () => {
		fireEvent.click(
			screen.getByRole("button", { name: "confirm remove home" })
		);
		await flushPromises();
	});

	expect(screen.queryByText("Apartment")).not.toBeInTheDocument();

	expect(
		screen.getByText("No Homes available! Click below to add.")
	).toBeInTheDocument();
});
