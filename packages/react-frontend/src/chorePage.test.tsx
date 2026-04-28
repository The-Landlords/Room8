import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";
import ChorePage from "./chorePage";

jest.mock("./components/list", () => {
	return function MockList(props: {
		handleAddClick: () => void;
		handleRemoveClick: () => void;
	}) {
		return <button onClick={props.handleAddClick}>+</button>;
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
