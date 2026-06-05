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

function jsonResponse(data: unknown) {
	return {
		ok: true,
		json: async () => data,
	} as Response;
}

function mockRulesFetch({
	initialRules = [],
	refreshedRules = initialRules,
	voteRefreshRules = refreshedRules,
	deleteVoteResponse = { deleted: true },
}: {
	initialRules?: Rule[];
	refreshedRules?: Rule[];
	voteRefreshRules?: Rule[];
	deleteVoteResponse?: { deleted?: boolean };
} = {}) {
	let rulesGetCount = 0;

	globalThis.fetch = vi.fn(async (input, init) => {
		const url = String(input);
		const method = init?.method ?? "GET";

		// Used by RulesPage.fetchMe.
		if (url === `${API_BASE}/auth/me` && method === "GET") {
			return jsonResponse({
				_id: "test-vote-id",
			});
		}

		// Used by Header and by RulesPage.fetchRules.
		if (url === `${API_BASE}/homes/code/testhomecode` && method === "GET") {
			return jsonResponse({
				_id: "home-1",
				homeName: "Test Home",
			});
		}

		// Used by RulesPage.fetchRules.
		if (
			url === `${API_BASE}/relate/home/home-1/residents` &&
			method === "GET"
		) {
			return jsonResponse({
				count: 1,
			});
		}

		// Used by RulesPage.fetchRules.
		if (
			url === `${API_BASE}/homes/rules/testhomecode` &&
			method === "GET"
		) {
			rulesGetCount += 1;

			if (rulesGetCount === 1) {
				return jsonResponse(initialRules);
			}

			if (rulesGetCount === 2) {
				return jsonResponse(refreshedRules);
			}

			return jsonResponse(voteRefreshRules);
		}

		// Used by RulesPage.handleAdd.
		if (url === `${API_BASE}/homes/rules` && method === "POST") {
			return jsonResponse(makeRule());
		}

		// Used by RulesPage.handleVote.
		if (url === `${API_BASE}/rules/rule-1/vote` && method === "POST") {
			return jsonResponse({});
		}

		// Used by RulesPage.handleDeleteVote.
		if (
			url === `${API_BASE}/rules/rule-1/delete-vote` &&
			method === "POST"
		) {
			return jsonResponse(deleteVoteResponse);
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

beforeEach(() => {
	mockRulesFetch();
});

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

test("renders rules page with home name", async () => {
	mockRulesFetch({
		initialRules: [],
	});

	renderRulesPage();

	expect(await screen.findByText(/Test Home.*Rules/i)).toBeInTheDocument();

	expect(screen.getByRole("button", { name: "+" })).toBeInTheDocument();
});

test("renders rules fetched from backend", async () => {
	mockRulesFetch({
		initialRules: [makeRule()],
	});

	renderRulesPage();

	expect(
		await screen.findByText("Quiet hours after 10pm")
	).toBeInTheDocument();

	expect(screen.getByText(/pending/i)).toBeInTheDocument();
});

test("clicking add opens the real add rule overlay", async () => {
	mockRulesFetch({
		initialRules: [],
	});

	renderRulesPage();

	await screen.findByText(/Test Home.*Rules/i);

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
	mockRulesFetch({
		initialRules: [],
	});

	renderRulesPage();

	await screen.findByText(/Test Home.*Rules/i);

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
	mockRulesFetch({
		initialRules: [],
		refreshedRules: [makeRule()],
	});

	renderRulesPage();

	await screen.findByText(/Test Home.*Rules/i);

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
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
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
	mockRulesFetch({
		initialRules: [makeRule()],
		refreshedRules: [
			makeRule({
				status: "CONFIRMED",
				votes: [{ voteId: "test-vote-id", vote: "YES" }],
			}),
		],
	});

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
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					vote: "YES",
				}),
			})
		);
	});

	expect(await screen.findByText(/approved/i)).toBeInTheDocument();
});

test("clicking remove mode shows the real delete vote controls", async () => {
	mockRulesFetch({
		initialRules: [makeRule()],
	});

	renderRulesPage();

	expect(
		await screen.findByText("Quiet hours after 10pm")
	).toBeInTheDocument();

	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "-" }));

	expect(getTrashButton()).toBeInTheDocument();
});

test("cancel closes the real delete vote panel", async () => {
	mockRulesFetch({
		initialRules: [makeRule()],
	});

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
	mockRulesFetch({
		initialRules: [makeRule()],
		deleteVoteResponse: {
			deleted: true,
		},
	});

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
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
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
