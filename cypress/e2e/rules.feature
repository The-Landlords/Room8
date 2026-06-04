Feature: Rules
  Background:
    Given I am viewing the test home's "rules" page

  Scenario: The home's rules and statuses are shown
    Then I should see the home's rules and statuses

  Scenario: A resident can add a rule
    When I open the add rule dialog
    Then I should see the add rule dialog
    When I submit a rule named "Clean the common area on Sundays"
    Then the add rule dialog should close

  Scenario: A resident can cancel adding a rule
    When I open the add rule dialog
    And I cancel the add rule dialog
    Then the add rule dialog should close

  Scenario: A resident can toggle rule voting controls
    When I open rule voting controls
    Then I should see rule voting controls
    When I save rule voting controls
    Then I should not see rule voting controls

  Scenario: A resident can request rule deletion
    When I open rule delete mode
    And I choose to delete the rule "Quiet hours after 10PM"
    Then I should see the delete-rule voting panel
    When I cancel rule deletion
    Then I should not see the delete-rule voting panel
