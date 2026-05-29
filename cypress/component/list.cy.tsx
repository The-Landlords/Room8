import React from "react";
import { MemoryRouter } from "react-router-dom";
import List from "../../packages/react-frontend/src/components/list";

describe("<List />", () => {
  it("renders an empty list", () => {
    cy.mount(
      <MemoryRouter>
        <List<string>
          item="Home Spaces"
          items={[]}
          handleAddClick={cy.stub().as("handleAddClick")}
          handleRemoveClick={cy.stub().as("handleRemoveClick")}
          renderItem={(item) => item}
          getKey={(item) => item}
        />
      </MemoryRouter>
    );

    cy.contains("Current Home Spaces").should("exist");
    cy.contains("No Home Spaces").should("exist");
  });

  it("renders list items", () => {
    cy.mount(
      <MemoryRouter>
        <List<string>
          item="Home Spaces"
          items={["Kitchen", "Living Room"]}
          homeCode={["abc123", "def456"]}
          handleAddClick={cy.stub().as("handleAddClick")}
          handleRemoveClick={cy.stub().as("handleRemoveClick")}
          renderItem={(item) => item}
          getKey={(item) => item}
        />
      </MemoryRouter>
    );

    cy.contains("Kitchen").should("exist");
    cy.contains("Living Room").should("exist");
  });

  it("calls add handler when plus button is clicked", () => {
    cy.mount(
      <MemoryRouter>
        <List<string>
          item="Home Spaces"
          items={["Kitchen"]}
          handleAddClick={cy.stub().as("handleAddClick")}
          handleRemoveClick={cy.stub().as("handleRemoveClick")}
          renderItem={(item) => item}
          getKey={(item) => item}
        />
      </MemoryRouter>
    );

    cy.contains("button", "+").click();
    cy.get("@handleAddClick").should("have.been.calledOnce");
  });

  it("removes an item in remove mode", () => {
    cy.mount(
      <MemoryRouter>
        <List<string>
          item="Home Spaces"
          items={["Kitchen"]}
          handleAddClick={cy.stub().as("handleAddClick")}
          handleRemoveClick={cy.stub().as("handleRemoveClick")}
          renderItem={(item) => item}
          getKey={(item) => item}
        />
      </MemoryRouter>
    );

    cy.contains("button", "-").click();
    cy.get("button").first().click();

    cy.get("@handleRemoveClick").should("have.been.calledWith", "Kitchen");
  });
});