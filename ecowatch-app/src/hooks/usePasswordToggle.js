import { useState } from "react";

/**
 * usePasswordToggle — manages show/hide state for a password field.
 */
export function usePasswordToggle() {
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible((prev) => !prev);

  return {
    isVisible,
    inputType: isVisible ? "text" : "password",
    iconName: isVisible ? "visibility_off" : "visibility",
    toggleVisibility,
  };
}
