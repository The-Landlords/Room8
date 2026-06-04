Feature: Groceries
  Background:
    Given I am viewing the test home's "groceries" page

  Scenario: Grocery items are shown for the active home
    Then I should see grocery items for the test home

  Scenario: A resident can add a grocery item
    When I open the add grocery dialog
    Then I should see the add grocery dialog
    When I submit a grocery item named "New grocery"
    Then I should see the grocery item "New grocery"

  Scenario: A resident can cancel grocery remove mode
    When I open grocery remove mode
    And I cancel remove mode
    Then I should see add and remove controls

  Scenario: A resident can remove a grocery item
    When I open grocery remove mode
    And I delete the grocery item "Milk"
    Then I should not see the grocery item "Milk"
