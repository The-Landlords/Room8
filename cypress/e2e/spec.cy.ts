describe("Frontend UI Tests", () => {
	const FRONTEND_URL = "http://localhost:5173";
	const API_URL = "http://localhost:8000/";
	const TESTUSER5 = {
		_id: "665000000000000000000005",
		username: "TESTUSER5",
		password: "TESTUSER5",
		fullName: "Test User",
		pronouns: "",
		DOB: "2000-01-01",
		allergens: [],
		likes: [],
		dislikes: [],
		phone: "+15555555555",
		emergencyContact: {
			name: "Emergency Contact",
			phone: "+15555555556",
			relationship: "Friend",
		},
		settings: {
			textSize: "medium",
			theme: "light",
			colorBlindMode: "off",
			scheduleVisibility: "roommates",
		},
	};

	const mockHome = {
		_id: "775000000000000000000123",
		homeCode: "ABC123",
		homeName: "Test House",
		address: "123 Main St",
	};

	const mockResidents = [
		{ _id: "resident-1", fullName: "bob joe" },
		{ _id: "resident-2", fullName: "Bar B Ben" },
		{ _id: "resident-3", fullName: "mike ty" },
		{ _id: "resident-4", fullName: "michael" },
		{ _id: "resident-5", fullName: "rule" },
		{ _id: "resident-6", fullName: "subway sandwitch" },
	];

	const mockGuests = [TESTUSER5];

	const mockRules = [
		{
			_id: "rule-1",
			description: "Quiet hours after 10PM",
			status: "PENDING",
			votes: [{ voteId: TESTUSER5._id, vote: "YES" }],
			deleteVotes: [],
			deleteStatus: "NONE",
		},
		{
			_id: "rule-2",
			description: "TEST",
			status: "REJECTED",
			votes: [],
			deleteVotes: [],
			deleteStatus: "NONE",
		},
		{
			_id: "rule-3",
			description: "Wash dishes on tuesdays",
			status: "PENDING",
			votes: [],
			deleteVotes: [],
			deleteStatus: "NONE",
		},
	];

	const mockEvents = [
		{
			_id: "event-1",
			title: "testing",
			description: "ugh",
			start: "2026-09-27T08:00:00",
			end: "2026-09-27T09:00:00",
			location: "Kitchen",
		},
		{
			_id: "event-2",
			title: "Robert birthday",
			description: "birthday",
			start: "2026-09-28T08:00:00",
			end: "2026-09-28T09:00:00",
			location: "Living Room",
		},
		{
			_id: "event-3",
			title: "TEST",
			description: "test event",
			start: "2026-09-29T08:00:00",
			end: "2026-09-29T09:00:00",
			location: "Room 8",
		},
	];

	const mockChores = [
		{ _id: "chore-1", title: "Dishes" },
		{ _id: "chore-2", title: "Trash" },
	];

	const mockGroceries = [
		{
			_id: "grocery-1",
			title: "Milk",
			quantity: 1,
			price: 4.5,
			homeId: mockHome._id,
			status: "PENDING",
		},
	];

	const mockHomeDisplay = {
		name: mockHome.homeName,
		groceries: mockGroceries,
		rules: mockRules,
		events: mockEvents,
		chores: mockChores,
	};

	function mockApiForTestUser5() {
		cy.intercept("POST", `${API_URL}login`, (req) => {
			const body =
				typeof req.body === "string"
					? JSON.parse(req.body)
					: req.body;

			expect(body).to.deep.equal({
				username: TESTUSER5.username,
				password: TESTUSER5.password,
			});

			req.reply({
				statusCode: 200,
				body: {
					message: "Login successful",
					userId: TESTUSER5._id,
					username: TESTUSER5.username,
				},
			});
		}).as("loginAsTestUser5");

		cy.intercept("POST", `${API_URL}logout`, {
			statusCode: 200,
			body: { message: "Logged out" },
		});
		cy.intercept("GET", `${API_URL}auth/me`, {
			statusCode: 200,
			body: TESTUSER5,
		});
		cy.intercept("GET", `${API_URL}users/me`, {
			statusCode: 200,
			body: TESTUSER5,
		});
		cy.intercept("PATCH", `${API_URL}users/me`, {
			statusCode: 200,
			body: TESTUSER5,
		});
		cy.intercept("GET", `${API_URL}relate/me`, {
			statusCode: 200,
			body: [mockHome],
		}).as("getHomesForTestUser5");
		cy.intercept("PATCH", `${API_URL}relate/me/${mockHome.homeName}`, {
			statusCode: 200,
			body: mockHome,
		});
		cy.intercept("GET", `${API_URL}auth/residents/${mockHome.homeCode}`, {
			statusCode: 200,
			body: mockResidents,
		});
		cy.intercept("GET", `${API_URL}auth/guests/me/${mockHome.homeCode}`, {
			statusCode: 200,
			body: mockGuests,
		});
		cy.intercept(
			"GET",
			`${API_URL}auth/relationship/me/${mockHome.homeCode}`,
			{
				statusCode: 200,
				body: { relationship: "RESIDENT" },
			}
		);
		cy.intercept("GET", `${API_URL}homes/code/${mockHome.homeCode}`, {
			statusCode: 200,
			body: mockHome,
		});
		cy.intercept(
			"GET",
			`${API_URL}relate/home/${mockHome._id}/residents`,
			{
				statusCode: 200,
				body: { count: mockResidents.length },
			}
		);
		cy.intercept("GET", `${API_URL}homes/rules/${mockHome.homeCode}`, {
			statusCode: 200,
			body: mockRules,
		});
		cy.intercept("POST", `${API_URL}homes/rules`, {
			statusCode: 201,
			body: mockRules[0],
		});
		cy.intercept("POST", `${API_URL}rules/*/vote`, {
			statusCode: 200,
			body: { message: "Vote recorded" },
		});
		cy.intercept("POST", `${API_URL}rules/*/delete-vote`, {
			statusCode: 200,
			body: { deleted: false },
		});
		cy.intercept("GET", `${API_URL}homeId/${mockHome._id}/events/`, {
			statusCode: 200,
			body: mockEvents,
		});
		cy.intercept("DELETE", `${API_URL}events/*`, {
			statusCode: 200,
			body: { message: "Event removed" },
		});
		cy.intercept("GET", `${API_URL}${mockHome.homeCode}/chores`, {
			statusCode: 200,
			body: mockChores,
		});
		cy.intercept("POST", `${API_URL}${mockHome.homeCode}/chores`, {
			statusCode: 201,
			body: { _id: "chore-3", title: "New chore" },
		});
		cy.intercept("DELETE", `${API_URL}${mockHome.homeCode}/chores/*`, {
			statusCode: 200,
			body: { message: "Chore removed" },
		});
		cy.intercept("GET", `${API_URL}${mockHome.homeCode}/grocery`, {
			statusCode: 200,
			body: mockGroceries,
		});
		cy.intercept("POST", `${API_URL}${mockHome.homeCode}/grocery`, {
			statusCode: 201,
			body: {
				_id: "grocery-2",
				title: "New grocery",
				quantity: 1,
				price: 0,
				homeId: mockHome._id,
				status: "PENDING",
			},
		});
		cy.intercept("DELETE", `${API_URL}${mockHome.homeCode}/grocery/*`, {
			statusCode: 200,
			body: { message: "Grocery removed" },
		});
		cy.intercept(
			"GET",
			`${API_URL}auth/homeDisplay/me/${mockHome.homeCode}`,
			{
				statusCode: 200,
				body: mockHomeDisplay,
			}
		);
	}

	it("should simulate a complete user work flow", () => {
		mockApiForTestUser5();
		cy.visit(`${FRONTEND_URL}`);
		// Page URL changed.
		cy.url()
		  .should('eq', 'http://localhost:5173/')
		// The page displays a 'Sign In' heading.
		cy.get('#root h1.header')
		  .should('contain.text', 'Sign In')
		// A username input field is visible.
		cy.get('#root input[placeholder="Username"]')
		  .should('have.value', '')
		// A 'Sign In' button is visible.
		cy.get('#root button.button')
		  .should('contain.text', 'Sign In')
		// A 'Sign Up' link is visible.
		cy.get('#root a.text-blue-500')
		  .should(($el) => {
		    expect($el).to.have.attr('href', '/signup')
		    expect($el).to.contain.text('Sign Up')
		  })
		
		
		cy.get('#root form.w-full').click();
		cy.get('#root input[placeholder="Username"]').click();
		cy.get('#root input[placeholder="Username"]').type(TESTUSER5.username);
		// The username input field now contains the value 'TESTUSER5'.
		cy.get('#root input[placeholder="Username"]')
		  .should('have.value', TESTUSER5.username)
		
		cy.get('#root input[placeholder="Password"]').click();
		cy.get('#root input[placeholder="Password"]').type(TESTUSER5.password);
		cy.get('#root button.button').click();
		cy.wait("@loginAsTestUser5");
		// The page heading changed from 'Sign In' to 'Home Spaces'.
		cy.get('#root h1.header')
		  .should('contain.text', 'Home Spaces')
		// A subheading 'Current Home Spaces' is now visible.
		cy.get('#root h1.header-secondary')
		  .should('contain.text', 'Current Home Spaces')
		// A '+' button is now visible.
		cy.get('#root button:nth-child(1)')
		  .should('contain.text', '+')
		// A '-' button is now visible.
		cy.get('#root button:nth-child(2)')
		  .should('contain.text', '-')
		// A settings icon is now visible.
		cy.get('#root div.iconWrapper a')
		  .should('have.attr', 'href', '/settings')
		// An icon to view residents is now visible.
		cy.get('#root div.ml-auto a:nth-child(1)')
		  .should('have.attr', 'href', '/residents/ABC123')
		// An icon to view rules is now visible.
		cy.get('#root a:nth-child(2)')
		  .should('have.attr', 'href', '/rules/ABC123')
		// An icon to view events is now visible.
		cy.get('#root a:nth-child(3)')
		  .should('have.attr', 'href', '/events/ABC123')
		
		cy.get('#root svg.fa-people-roof').click();
		// The page heading is now 'Residents'.
		cy.get('#root div:nth-child(2) h1.header')
		  .should('contain.text', 'Residents')
		// The resident 'bob joe' is displayed.
		cy.get('#root div:nth-child(2) div.list-container ul li:nth-child(1) span.flex div.flex h1.header-secondary')
		  .should('contain.text', 'bob joe')
		// The resident 'mike ty' is displayed.
		cy.get('#root div:nth-child(2) div.list-container ul li:nth-child(3) span.flex div.flex h1.header-secondary')
		  .should('contain.text', 'mike ty')
		// The resident 'Bar B Ben' is displayed.
		cy.get('#root div:nth-child(2) div.list-container ul li:nth-child(2)')
		  .should('contain.text', 'Bar B Ben')
		// The resident 'michael' is displayed.
		cy.get('#root li:nth-child(4)')
		  .should('contain.text', 'michael')
		// The resident 'rule' is displayed.
		cy.get('#root li:nth-child(5)')
		  .should('contain.text', 'rule')
		// The resident 'subway sandwitch' is displayed.
		cy.get('#root li:nth-child(6)')
		  .should('contain.text', 'subway sandwitch')
		// The guest 'Test User' is displayed.
		cy.get('#root div:nth-child(3) li:nth-child(1)')
		  .should('contain.text', 'Test User')
		
		cy.get('#root button.flex').click();
		// The page heading is now 'Home Spaces'.
		cy.get('#root h1.header')
		  .should('contain.text', 'Home Spaces')
		// A home space named 'Test House' is displayed.
		cy.get('#root span.flex div:nth-child(1) div:nth-child(1)')
		  .should('contain.text', 'Test House')
		// The 'Residents' icon is visible.
		cy.get('#root div.ml-auto a:nth-child(1)')
		  .should('have.attr', 'href', '/residents/ABC123')
		// The 'Rules' icon is visible.
		cy.get('#root a:nth-child(2)')
		  .should('have.attr', 'href', '/rules/ABC123')
		// The 'Events' icon is visible.
		cy.get('#root a:nth-child(3)')
		  .should('have.attr', 'href', '/events/ABC123')
		// The 'Chores' icon is visible.
		cy.get('#root a:nth-child(4)')
		  .should('have.attr', 'href', '/ABC123/chores')
		// The 'Grocery' icon is visible.
		cy.get('#root a:nth-child(5)')
		  .should('have.attr', 'href', '/grocery/ABC123')
		// The 'View Home' icon is visible.
		cy.get('#root a:nth-child(6)')
		  .should('have.attr', 'href', '/homeDisplay/me/ABC123')
		
		cy.get(
		    '#root path[d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM88 64C74.7 64 64 74.7 64 88s10.7 24 24 24l48 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L88 64zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24l48 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-48 0zm70.3 160c-11.3 0-21.9 5.1-28.9 13.9L69.3 409c-8.3 10.3-6.6 25.5 3.7 33.7s25.5 6.6 33.7-3.8l47.1-58.8 15.2 50.7c3 10.2 12.4 17.1 23 17.1l104 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-86.1 0-16.1-53.6c-4.7-15.7-19.1-26.4-35.5-26.4z"]'
		).click();
		// The page heading changed to 'Rules for Test House'.
		cy.get('#root h1.flex-1')
		  .should('contain.text', 'Rules for Test House')
		// The secondary heading changed to 'Rules'.
		cy.get('#root h1.header-secondary')
		  .should('contain.text', 'Rules')
		// A new rule 'Quiet hours after 10PM' is displayed.
		cy.get('#root li:nth-child(1) p.truncate')
		  .should('contain.text', 'Quiet hours after 10PM')
		// The status of 'Quiet hours after 10PM' rule is 'Pending'.
		cy.get('#root li:nth-child(1) p.text-right')
		  .should('contain.text', 'Status : Pending')
		// A new rule 'TEST' is displayed.
		cy.get('#root li:nth-child(2) p.truncate')
		  .should('contain.text', 'TEST')
		// The status of 'TEST' rule is 'Rejected'.
		cy.get('#root li:nth-child(2) p.text-right')
		  .should('contain.text', 'Status : Rejected')
		// A new rule 'Wash dishes on tuesdays' is displayed.
		cy.get('#root li:nth-child(3) p.truncate')
		  .should('contain.text', 'Wash dishes on tuesdays')
		// The status of 'Wash dishes on tuesdays' rule is 'Pending'.
		cy.get('#root li:nth-child(3) p.text-right')
		  .should('contain.text', 'Status : Pending')
		
		cy.get('#root div.flex.gap-4 button:nth-child(1)').click();
		// A modal dialog to add a rule has appeared.
		cy.get('#root div.fixed')
		  .should('be.visible')
		// The modal dialog displays the heading 'Add Rule'.
		cy.get('#root h2.mb-4')
		  .should(($el) => {
		    expect($el).to.be.visible
		    expect($el).to.contain.text('Add Rule')
		  })
		// A textarea for the rule input is now visible.
		cy.get('#root textarea.border')
		  .should('be.visible')
		// A 'Cancel' button is now visible within the modal.
		cy.get('#root div.gap-3 button:nth-child(1)')
		  .should(($el) => {
		    expect($el).to.be.visible
		    expect($el).to.contain.text('Cancel')
		  })
		// An 'Add' button is now visible within the modal.
		cy.get('#root div.gap-3 button.button')
		  .should(($el) => {
		    expect($el).to.be.visible
		    expect($el).to.contain.text('Add')
		  })
		
		cy.get('#root div.fixed').click();
		cy.get('#root div.gap-3 button:nth-child(1)').click();
		cy.get('#root div.flex.gap-4 button:nth-child(2)').click();
		// The 'Cancel' button is visible.
		cy.get('#root div.button')
		  .should('contain.text', 'Cancel')
		
		cy.get('#root div.button button').click();
		// A '+' button is now visible.
		cy.get('#root div.flex.gap-4 button:nth-child(1)')
		  .should('contain.text', '+')
		// A '-' button is now visible.
		cy.get('#root div.flex.gap-4 button:nth-child(2)')
		  .should('contain.text', '-')
		// A 'Vote' button is now visible.
		cy.get('#root button.absolute')
		  .should(($el) => {
		    expect($el).to.be.visible
		    expect($el).to.contain.text('Vote')
		  })
		
		cy.get('#root button.absolute').click();
		// The voting buttons and count for the 'Quiet hours after 10PM' rule are now visible.
		cy.get('#root li:nth-child(1) div.justify-end')
		  .should('be.visible')
		// The 'YES' button for 'Quiet hours after 10PM' rule is visible.
		cy.get('#root li:nth-child(1) button[aria-label="YES"]')
		  .should('contain.text', '✓')
		// The 'NO' button for 'Quiet hours after 10PM' rule is visible.
		cy.get('#root li:nth-child(1) button[aria-label="NO"]')
		  .should('contain.text', 'X')
		// The voting count for 'Quiet hours after 10PM' rule is visible and shows 'YES 1 | NO 0'.
		cy.get('#root li:nth-child(1) div.justify-end div.items-center p.whitespace-nowrap')
		  .should('contain.text', 'YES 1 | NO 0')
		// The voting buttons and count for the 'TEST' rule are now visible.
		cy.get('#root li:nth-child(2) div.justify-end')
		  .should('be.visible')
		// The 'YES' button for 'TEST' rule is visible.
		cy.get('#root li:nth-child(2) button[aria-label="YES"]')
		  .should('contain.text', '✓')
		// The 'NO' button for 'TEST' rule is visible.
		cy.get('#root li:nth-child(2) button[aria-label="NO"]')
		  .should('contain.text', 'X')
		// The voting buttons and count for the 'Wash dishes on tuesdays' rule are now visible.
		cy.get('#root li:nth-child(3) div.justify-end')
		  .should('be.visible')
		
		cy.get('#root button.absolute').click();
		// The voting buttons and counts for the 'Quiet hours after 10PM' rule are no longer visible.
		cy.get('#root li:nth-child(1) div.flex')
		  .should('not.be.visible')
		// The voting buttons and counts for the 'TEST' rule are no longer visible.
		cy.get('#root li:nth-child(2) div.flex')
		  .should('not.be.visible')
		// The voting buttons and counts for the 'Wash dishes on tuesdays' rule are no longer visible.
		cy.get('#root li:nth-child(3) div.flex')
		  .should('not.be.visible')
		
		cy.get('#root button[type="button"]').click();
		// The page heading is now 'Home Spaces'.
		cy.get('#root h1.header')
		  .should('contain.text', 'Home Spaces')
		// A subheading 'Current Home Spaces' is now visible.
		cy.get('#root h1.header-secondary')
		  .should('contain.text', 'Current Home Spaces')
		// The 'Residents' icon is visible.
		cy.get('#root div.ml-auto a:nth-child(1)')
		  .should('have.attr', 'href', '/residents/ABC123')
		// The 'Rules' icon is visible.
		cy.get('#root a:nth-child(2)')
		  .should('have.attr', 'href', '/rules/ABC123')
		// The 'Events' icon is visible.
		cy.get('#root a:nth-child(3)')
		  .should('have.attr', 'href', '/events/ABC123')
		// The 'Chores' icon is visible.
		cy.get('#root a:nth-child(4)')
		  .should('have.attr', 'href', '/ABC123/chores')
		// The 'Grocery' icon is visible.
		cy.get('#root a:nth-child(5)')
		  .should('have.attr', 'href', '/grocery/ABC123')
		// The 'View Home' icon is visible.
		cy.get('#root a:nth-child(6)')
		  .should('have.attr', 'href', '/homeDisplay/me/ABC123')
		
		cy.get('#root svg.fa-calendar').click();
		// The page heading changed to 'Events for Test House'.
		cy.get('#root h1.header')
		  .should('contain.text', 'Events for Test House')
		// A subheading 'Events' is now visible.
		cy.get('#root h1.header-secondary')
		  .should('contain.text', 'Events')
		// A new event 'testing' is displayed.
		cy.get('#root li:nth-child(1) div:nth-child(1) div:nth-child(1)')
		  .should('contain.text', 'testing')
		// The description 'ugh' for the 'testing' event is displayed.
		cy.get('#root li:nth-child(1) div:nth-child(1) div:nth-child(2)')
		  .should('contain.text', 'ugh')
		// The date 'Sunday, Sep 27' for the 'testing' event is displayed.
		cy.get('#root li:nth-child(1) span:nth-child(2)')
		  .should('contain.text', 'Sunday, Sep 27')
		// The start time '8:00 AM' for the 'testing' event is displayed.
		cy.get('#root li:nth-child(1) span:nth-child(3)')
		  .should('contain.text', '8:00 AM')
		// A new event 'Robert birthday' is displayed.
		cy.get('#root li:nth-child(2) div:nth-child(1) div:nth-child(1)')
		  .should('contain.text', 'Robert birthday')
		// A new event 'TEST' is displayed.
		cy.get('#root li:nth-child(3) div:nth-child(1) div:nth-child(1)')
		  .should('contain.text', 'TEST')
		
		// cy.get('#root div.gap-4 button:nth-child(1)').click();
		// // A modal dialog to add an event has appeared.
		// cy.get('#root div.overlay-backdrop')
		//   .should('be.visible')
		// // The modal dialog displays the heading 'Add Event'.
		// cy.get('#root h2')
		//   .should(($el) => {
		//     expect($el).to.be.visible
		//     expect($el).to.contain.text('Add Event')
		//   })
		// // An input field for the event title is now visible.
		// cy.get('#root input[placeholder="Title"]')
		//   .should(($el) => {
		//     expect($el).to.be.visible
		//     expect($el).to.have.value('')
		//   })
		// // An input field for the event description is now visible.
		// cy.get('#root input[placeholder="Description"]')
		//   .should(($el) => {
		//     expect($el).to.be.visible
		//     expect($el).to.have.value('')
		//   })
		// // An input field for the event start date and time is now visible.
		// cy.get('#root input:nth-child(4)')
		//   .should(($el) => {
		//     expect($el).to.be.visible
		//     expect($el).to.have.value('')
		//   })
		// // An input field for the event end date and time is now visible.
		// cy.get('#root input[min=""]')
		//   .should(($el) => {
		//     expect($el).to.be.visible
		//     expect($el).to.have.value('')
		//   })
		// // An input field for the event location is now visible.
		// cy.get('#root input[placeholder="Location"]')
		//   .should(($el) => {
		//     expect($el).to.be.visible
		//     expect($el).to.have.value('')
		//   })
		// // An 'Add Event' button is now visible within the modal.
		// cy.get('#root button.self-center')
		//   .should(($el) => {
		//     expect($el).to.be.visible
		//     expect($el).to.contain.text('Add Event')
		//   })]
		cy.get('#root div.justify-center button:nth-child(2)').click();
		cy.get('#root div.button button').click();
		// A '+' button is visible.
		cy.get('#root div.gap-4 button:nth-child(1)')
		  .should('contain.text', '+')
		// A '-' button is visible.
		cy.get('#root div.justify-center button:nth-child(2)')
		  .should('contain.text', '-')
		
		cy.get('#root > div:nth-child(1) > button:nth-child(1)').click();
		// The page heading is now 'Home Spaces'.
		cy.get('#root h1.header')
		  .should('contain.text', 'Home Spaces')
		// The subheading is now 'Current Home Spaces'.
		cy.get('#root h1.header-secondary')
		  .should('contain.text', 'Current Home Spaces')
		// A home space named 'Test House' is displayed.
		cy.get('#root span.flex div:nth-child(1) div:nth-child(1)')
		  .should('contain.text', 'Test House')
		// The 'Residents' icon is visible.
		cy.get('#root div.ml-auto a:nth-child(1)')
		  .should('have.attr', 'href', '/residents/ABC123')
		// The 'Rules' icon is visible.
		cy.get('#root a:nth-child(2)')
		  .should('have.attr', 'href', '/rules/ABC123')
		// The 'Events' icon is visible.
		cy.get('#root a:nth-child(3)')
		  .should('have.attr', 'href', '/events/ABC123')
		// The 'Chores' icon is visible.
		cy.get('#root a:nth-child(4)')
		  .should('have.attr', 'href', '/ABC123/chores')
		// The 'Grocery' icon is visible.
		cy.get('#root a:nth-child(5)')
		  .should('have.attr', 'href', '/grocery/ABC123')
		
		cy.get(
		    '#root path[d="M256 0c23.7 0 44.4 12.9 55.4 32l8.6 0c35.3 0 64 28.7 64 64l0 352c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 96C0 60.7 28.7 32 64 32l8.6 0C83.6 12.9 104.3 0 128 0L256 0zm26.9 212.6c-10.7-7.8-25.7-5.4-33.5 5.3l-85.6 117.7-26.5-27.4c-9.2-9.5-24.4-9.8-33.9-.6s-9.8 24.4-.6 33.9l46.4 48c4.9 5.1 11.8 7.8 18.9 7.3s13.6-4.1 17.8-9.8L288.2 246.1c7.8-10.7 5.4-25.7-5.3-33.5zM136 64c-13.3 0-24 10.7-24 24s10.7 24 24 24l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L136 64z"]'
		).click();
		cy.get('#root div.gap-4 button:nth-child(1)').click();
		cy.get('#root button.self-start-safe').click();
		cy.get('#root button:nth-child(2)').click();
		cy.get('#root div.button button').click();
		cy.get('#root button.absolute').click();
		cy.get('#root svg.fa-cart-shopping').click();
		cy.get('#root div.gap-4 button:nth-child(1)').click();
		cy.get('#root button.self-start-safe').click();
		cy.get('#root button:nth-child(2)').click();
		cy.get('#root div.button').click();
		// cy.get('#root div.button button').click();
		cy.get('#root button.absolute').click();
		cy.get('svg[data-icon="angle-right"]').click()
		cy.get('#root button.flex').click();
		cy.get('#root svg.fa-user-gear').click();
		cy.get('#root div:nth-child(3) button.button').click();
		// cy.get('svg[data-icon="user-gear"]').click({ force: true })
		// cy.get('#root button.button.flex').click();

		cy.get('#root svg.fa-user-gear').click();
		cy.get('#root div:nth-child(4) button.button').click();
	});
});
