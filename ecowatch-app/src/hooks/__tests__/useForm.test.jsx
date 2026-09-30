import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useForm } from "../useForm";

function DummyFormComponent() {
  const { values, handleChange, resetForm, getFieldId } = useForm({
    title: "Initial Title",
    category: "Flooding",
  });

  return (
    <div>
      <label htmlFor={getFieldId("title")}>Title</label>
      <input
        id={getFieldId("title")}
        data-testid="title-input"
        name="title"
        value={values.title}
        onChange={handleChange}
      />
      <input
        data-testid="cat-input"
        name="category"
        value={values.category}
        onChange={handleChange}
      />
      <button data-testid="reset-btn" onClick={resetForm}>
        Reset
      </button>
      <span data-testid="title-display">{values.title}</span>
    </div>
  );
}

describe("useForm custom hook test suite", () => {
  it("initializes form values correctly", () => {
    render(<DummyFormComponent />);
    expect(screen.getByLabelText("Title")).toBe(screen.getByTestId("title-input"));
    expect(screen.getByTestId("title-input").value).toBe("Initial Title");
    expect(screen.getByTestId("cat-input").value).toBe("Flooding");
  });

  it("updates state upon input change event", () => {
    render(<DummyFormComponent />);
    const titleInput = screen.getByTestId("title-input");

    fireEvent.change(titleInput, { target: { name: "title", value: "Waterlogging Alert" } });
    expect(titleInput.value).toBe("Waterlogging Alert");
    expect(screen.getByTestId("title-display").textContent).toBe("Waterlogging Alert");
  });

  it("resets form values to initial state when resetForm is invoked", () => {
    render(<DummyFormComponent />);
    const titleInput = screen.getByTestId("title-input");
    const resetBtn = screen.getByTestId("reset-btn");

    fireEvent.change(titleInput, { target: { name: "title", value: "Temporary Text" } });
    expect(titleInput.value).toBe("Temporary Text");

    fireEvent.click(resetBtn);
    expect(titleInput.value).toBe("Initial Title");
  });
});
