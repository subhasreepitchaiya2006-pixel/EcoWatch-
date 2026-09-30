import { useState, useCallback, useId } from "react";

/**
 * useForm — reusable controlled-input state manager.
 * useCallback keeps handleChange's identity stable across renders.
 */
export function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const idPrefix = useId();

  const getFieldId = useCallback((name) => `${idPrefix}-${name}`, [idPrefix]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const resetForm = useCallback(() => setValues(initialValues), [initialValues]);

  return { values, handleChange, resetForm, setValues, getFieldId };
}
