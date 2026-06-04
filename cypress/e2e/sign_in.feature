Feature: Sign in and home navigation
  Scenario: The sign in form is ready for a visitor
    Given I open the sign in page
    Then I should see an empty sign in form
    And I can navigate to sign up from sign in

  Scenario: A valid user signs in and sees their home spaces
    Given I open the sign in page
    When I sign in as the test user
    Then I should see the home spaces list

  Scenario Outline: A resident can open each home space area
    Given I am signed in
    When I open the "<destination>" action for the test home
    Then I should be on the "<destination>" page

    Examples:
      | destination |
      | residents   |
      | rules       |
      | calendar    |
      | chores      |
      | groceries   |
      | overview    |
      | settings    |
