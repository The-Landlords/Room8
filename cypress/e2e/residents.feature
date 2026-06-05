Feature: Residents
  Scenario: Residents and guests are shown for the active home
    Given I am viewing the test home's "residents" page
    Then I should see residents and guests for the test home

  Scenario: A resident can open guest voting controls
    Given I am viewing the test home's "residents" page
    When I open guest voting
    Then I should see guest voting controls

  Scenario: The residents back button returns to home spaces
    Given I opened the test home's "residents" page from home spaces
    When I use the page back button
    Then I should see the home spaces list
