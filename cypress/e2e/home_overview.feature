Feature: Home overview
  Scenario: The home overview summarizes the active home
    Given I am viewing the test home's "overview" page
    Then I should see the test home's overview summary

  Scenario: The overview back button returns to home spaces
    Given I opened the test home's "overview" page from home spaces
    When I use the page back button
    Then I should see the home spaces list
