Feature: Chores
  Background:
    Given I am viewing the test home's "chores" page

  Scenario: Chores are shown for the active home
    Then I should see chores for the test home

  Scenario: A resident can add a chore
    When I open the add chore dialog
    Then I should see the add chore dialog
    When I submit a chore named "New chore"
    Then I should see the chore "New chore"

  Scenario: A resident can cancel chore remove mode
    When I open chore remove mode
    And I cancel remove mode
    Then I should see add and remove controls

  Scenario: A resident can remove a chore
    When I open chore remove mode
    And I delete the chore "Dishes"
    Then I should not see the chore "Dishes"
