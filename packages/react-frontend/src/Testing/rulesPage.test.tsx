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
import RulesPage from "../pages/rulesPage";
import { API_BASE } from "../config";

type Rule = {
	_id: string;
	description: string;
	status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";
	createdAt: string;
	votes: Array<{ voteId: string; vote: "YES" | "NO" }>;
	deleteVotes: Array<{ voteId: string; vote: "YES" | "NO" }>;
	deleteStatus: "NONE" | "PENDING" | "REJECTED" | "CONFIRMED";
};

function renderRulesPage() {
	return render(
		<MemoryRouter initialEntries={["/rules/testhomecode"]}>
			<Routes>
				<Route path="/rules/:homeCode" element={<RulesPage />} />
			</Routes>
		</MemoryRouter>
	);
}

function makeRule(overrides: Partial<Rule> = {}): Rule {
	return {
		_id: "rule-1",
		description: "Quiet hours after 10pm",
		status: "PENDING",
		createdAt: "2099-01-01T00:00:00.000Z",
		votes: [],
		deleteVotes: [],
		deleteStatus: "NONE",
		...overrides,
	};
}

function okJson(data: unknown) {
	return {
		ok: true,
		json: async () => data,
	};
}

function mockPageLoad(rules: Rule[]) {
	return [
		okJson({ _id: "home-1", homeName: "Test Home" }),
		okJson({ count: 1 }),
		okJson(rules),
	];
}

function mockFetchWithRules(rules: Rule[]) {
	const pageLoad = mockPageLoad(rules);

	globalThis.fetch = vi
		.fn()
		.mockResolvedValueOnce(pageLoad[0])
		.mockResolvedValueOnce(pageLoad[1])
		.mockResolvedValueOnce(pageLoad[2]) as unknown as typeof fetch;
}

function mockFetchForAddingRule() {
	const initialLoad = mockPageLoad([]);
	const refreshLoad = mockPageLoad([makeRule()]);

	globalThis.fetch = vi
		.fn()
		.mockResolvedValueOnce(initialLoad[0])
		.mockResolvedValueOnce(initialLoad[1])
		.mockResolvedValueOnce(initialLoad[2])
		.mockResolvedValueOnce(okJson(makeRule()))
		.mockResolvedValueOnce(refreshLoad[0])
		.mockResolvedValueOnce(refreshLoad[1])
		.mockResolvedValueOnce(refreshLoad[2]) as unknown as typeof fetch;
}

function mockFetchForVotingRule() {
	const initialLoad = mockPageLoad([makeRule()]);
	const refreshLoad = mockPageLoad([
		makeRule({
			status: "CONFIRMED",
			votes: [{ voteId: "test-vote-id", vote: "YES" }],
		}),
	]);

	globalThis.fetch = vi
		.fn()
		.mockResolvedValueOnce(initialLoad[0])
		.mockResolvedValueOnce(initialLoad[1])
		.mockResolvedValueOnce(initialLoad[2])
		.mockResolvedValueOnce(okJson({}))
		.mockResolvedValueOnce(refreshLoad[0])
		.mockResolvedValueOnce(refreshLoad[1])
		.mockResolvedValueOnce(refreshLoad[2]) as unknown as typeof fetch;
}

function mockFetchForDeletedRule() {
	const initialLoad = mockPageLoad([makeRule()]);

	globalThis.fetch = vi
		.fn()
		.mockResolvedValueOnce(initialLoad[0])
		.mockResolvedValueOnce(initialLoad[1])
		.mockResolvedValueOnce(initialLoad[2])
		.mockResolvedValueOnce(
			okJson({ deleted: true })
		) as unknown as typeof fetch;
}

function getTrashButton() {
	const trashButton = screen
		.getAllByRole("button")
		.find((button) => button.querySelector("svg[data-icon='trash-can']"));

	expect(trashButton).toBeDefined();

	return trashButton as HTMLButtonElement;
}

function setupVoteIdStorage() {
	const storage = new Map<string, string>();

	Object.defineProperty(globalThis, "localStorage", {
		value: {
			getItem: vi.fn((key: string) => storage.get(key) ?? null),
			setItem: vi.fn((key: string, value: string) => {
				storage.set(key, value);
			}),
			removeItem: vi.fn((key: string) => {
				storage.delete(key);
			}),
			clear: vi.fn(() => {
				storage.clear();
			}),
		},
		writable: true,
		configurable: true,
	});
}

beforeEach(() => {
	setupVoteIdStorage();

	Object.defineProperty(globalThis, "crypto", {
		value: {
			randomUUID: vi.fn(() => "test-vote-id"),
		},
		writable: true,
		configurable: true,
	});

	mockFetchWithRules([]);
});

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

test("renders rules page with home name", async () => {
	renderRulesPage();

	expect(await screen.findByText("Rules for Test Home")).toBeInTheDocument();

	expect(screen.getByRole("button", { name: "+" })).toBeInTheDocument();
});

test("renders rules fetched from backend", async () => {
	mockFetchWithRules([makeRule()]);

	renderRulesPage();

	expect(
		await screen.findByText("Quiet hours after 10pm")
	).toBeInTheDocument();

	expect(screen.getByText(/pending/i)).toBeInTheDocument();
});

test("clicking add opens the real add rule overlay", async () => {
	renderRulesPage();

	await screen.findByText("Rules for Test Home");

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "+" }));

	expect(
		screen.getByRole("heading", { name: "Add Rule" })
	).toBeInTheDocument();

	expect(
		screen.getByPlaceholderText("e.g. Quiet hours after 10pm")
	).toBeInTheDocument();
});

test("cancel closes the real add rule overlay", async () => {
	renderRulesPage();

	await screen.findByText("Rules for Test Home");

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "+" }));

	expect(
		screen.getByRole("heading", { name: "Add Rule" })
	).toBeInTheDocument();

	await user.click(screen.getByRole("button", { name: "Cancel" }));

	expect(
		screen.queryByRole("heading", { name: "Add Rule" })
	).not.toBeInTheDocument();
});

test("adding a rule posts the rule and refreshes rules", async () => {
	mockFetchForAddingRule();

	renderRulesPage();

	await screen.findByText("Rules for Test Home");

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "+" }));

	await user.type(
		screen.getByPlaceholderText("e.g. Quiet hours after 10pm"),
		"Quiet hours after 10pm"
	);

	await user.click(screen.getByRole("button", { name: "Add" }));

	await waitFor(() => {
		expect(globalThis.fetch).toHaveBeenCalledWith(
			`${API_BASE}/homes/rules`,
			expect.objectContaining({
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					homeCode: "testhomecode",
					description: "Quiet hours after 10pm",
				}),
			})
		);
	});

	expect(
		await screen.findByText("Quiet hours after 10pm")
	).toBeInTheDocument();

	expect(
		screen.queryByRole("heading", { name: "Add Rule" })
	).not.toBeInTheDocument();
});

test("clicking yes vote posts vote and refreshes rules", async () => {
	mockFetchForVotingRule();

	renderRulesPage();

	expect(
		await screen.findByText("Quiet hours after 10pm")
	).toBeInTheDocument();

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: /vote/i }));

	await user.click(screen.getByRole("button", { name: /yes/i }));

	await waitFor(() => {
		expect(globalThis.fetch).toHaveBeenCalledWith(
			`${API_BASE}/rules/rule-1/vote`,
			expect.objectContaining({
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					vote: "YES",
				}),
			})
		);
	});

	expect(await screen.findByText(/approved/i)).toBeInTheDocument();
});

test("clicking remove mode shows the real delete vote controls", async () => {
	mockFetchWithRules([makeRule()]);

	renderRulesPage();

	expect(
		await screen.findByText("Quiet hours after 10pm")
	).toBeInTheDocument();

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "-" }));

	expect(getTrashButton()).toBeInTheDocument();
});

test("cancel closes the real delete vote panel", async () => {
	mockFetchWithRules([makeRule()]);

	renderRulesPage();

	expect(
		await screen.findByText("Quiet hours after 10pm")
	).toBeInTheDocument();

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "-" }));
	await user.click(getTrashButton());

	const deletePanel = screen
		.getByRole("heading", { name: /vote to delete this rule/i })
		.closest("div");

	expect(deletePanel).not.toBeNull();

	await user.click(
		within(deletePanel as HTMLElement).getByRole("button", {
			name: /cancel/i,
		})
	);

	expect(
		screen.queryByRole("heading", { name: /vote to delete this rule/i })
	).not.toBeInTheDocument();
});

test("delete vote removes rule when backend says deleted", async () => {
	mockFetchForDeletedRule();

	renderRulesPage();

	expect(
		await screen.findByText("Quiet hours after 10pm")
	).toBeInTheDocument();

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "-" }));
	await user.click(getTrashButton());

	expect(screen.getByText(/delete/i)).toBeInTheDocument();

	const yesButtons = screen.getAllByRole("button", { name: /yes/i });
	const deleteVoteYesButton = yesButtons[yesButtons.length - 1];

	await user.click(deleteVoteYesButton);

	await waitFor(() => {
		expect(globalThis.fetch).toHaveBeenCalledWith(
			`${API_BASE}/rules/rule-1/delete-vote`,
			expect.objectContaining({
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					voteId: "test-vote-id",
					vote: "YES",
				}),
			})
		);
	});

	expect(
		screen.queryByText("Quiet hours after 10pm")
	).not.toBeInTheDocument();
});
