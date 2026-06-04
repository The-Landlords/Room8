Feature: Calendar events
  Background:
    Given I am viewing the test home's "calendar" page

  Scenario: Upcoming events are shown for the active home
    Then I should see the upcoming events for the test home

  Scenario: A resident can collapse and expand upcoming events
    When I collapse upcoming events
    Then I should not see the first event
    When I expand upcoming events
    Then I should see the first event

  Scenario: A resident can add an event
    When I open the add event dialog
    Then I should see the add event dialog
    When I submit a new event
    Then I should see the new event

  Scenario: A resident can edit an event
    When I open the edit event dialog for "testing"
    Then I should see the edit event dialog
    When I update the event title to "Updated testing event"
    Then I should see the updated event

  Scenario: A resident can remove an event
    When I open event delete mode
    And I choose to remove the event "testing"
    Then I should see the remove event confirmation
    When I confirm event removal
    Then I should not see the removed event
