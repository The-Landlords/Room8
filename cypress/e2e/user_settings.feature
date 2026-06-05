Feature: User settings
  Background:
    Given I am viewing the user settings page

  Scenario: Profile settings are loaded for the current user
    Then I should see the current user's profile settings

  Scenario: A user can save profile, display, and visibility changes
    When I change profile details and display preferences
    And I save the profile
    Then the profile changes should be submitted
    And I should see the home spaces list

  Scenario: A user can sign out
    When I sign out
    Then I should see the sign in page
