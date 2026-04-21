import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";
import ChorePage from "./chorePage";

jest.mock("./components/list", () => {
	return function MockList() {
		return <button>+</button>;
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
	jest.restoreAllMocks();
});

test("renders the add button", async () => {
	renderChorePageWithHistory();

	expect(
		await screen.findByRole("button", { name: "+" })
	).toBeInTheDocument();
});

test("clicking the back button sends you to the previous page", async () => {
	const user = userEvent.setup();

	renderChorePageWithHistory();

	const backButton = await screen.findByRole("button", { name: "←" });
	await user.click(backButton);

	expect(await screen.findByText("Home Page")).toBeInTheDocument();
});
