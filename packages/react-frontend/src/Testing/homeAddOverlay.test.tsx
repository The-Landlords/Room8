import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { afterEach, expect, test, vi } from "vitest";
import HomeAddOverlay from "../components/homeAddOverlay";

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

function renderHomeAddOverlay() {
	const onPick = vi.fn();

	const result = render(<HomeAddOverlay onPick={onPick} />);

	return {
		...result,
		user: userEvent.setup(),
		onPick,
	};
}

test("renders home add options", () => {
	renderHomeAddOverlay();

	expect(
		screen.getByRole("heading", { name: /add options/i })
	).toBeInTheDocument();

	expect(
		screen.getByRole("button", { name: /add home/i })
	).toBeInTheDocument();

	expect(
		screen.getByRole("button", { name: /create home/i })
	).toBeInTheDocument();
});

test("clicking Add Home picks add", async () => {
	const { user, onPick } = renderHomeAddOverlay();

	await user.click(screen.getByRole("button", { name: /add home/i }));

	expect(onPick).toHaveBeenCalledWith("Add");
});

test("clicking Create Home picks create", async () => {
	const { user, onPick } = renderHomeAddOverlay();

	await user.click(screen.getByRole("button", { name: /create home/i }));

	expect(onPick).toHaveBeenCalledWith("Create");
});
