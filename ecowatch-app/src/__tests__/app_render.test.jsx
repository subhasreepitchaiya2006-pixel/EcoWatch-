import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import App from "../App";

describe("App Root Render", () => {
  it("renders home without crashing", () => {
    window.location.hash = "#/home";
    const { container } = render(<App />);
    expect(container).toBeDefined();
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it("renders signin page without crashing", () => {
    window.location.hash = "#/signin";
    const { container } = render(<App />);
    expect(container).toBeDefined();
    expect(container.innerHTML.length).toBeGreaterThan(0);
    expect(container.textContent).toContain("Sign In");
  });

  it("renders register page without crashing", () => {
    window.location.hash = "#/register";
    const { container } = render(<App />);
    expect(container).toBeDefined();
    expect(container.innerHTML.length).toBeGreaterThan(0);
    expect(container.textContent).toContain("Register");
  });

  it("renders community reports page without crashing", () => {
    window.location.hash = "#/community-reports";
    const { container } = render(<App />);
    expect(container).toBeDefined();
    expect(container.innerHTML.length).toBeGreaterThan(0);
    expect(container.textContent).toContain("Community");
  });

  it("renders disaster alerts page without crashing", () => {
    window.location.hash = "#/disaster-alerts";
    const { container } = render(<App />);
    expect(container).toBeDefined();
    expect(container.innerHTML.length).toBeGreaterThan(0);
    expect(container.textContent).toContain("Disaster Alerts");
  });
});
