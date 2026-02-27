import React, { useState, useEffect } from "react";
import { TextField, TextFieldProps } from "@mui/material";

type OptimizedTextFieldProps = Omit<TextFieldProps, "onChange"> & {
  value: string | number;
  onChange: (value: string) => void;
  debounceMs?: number;
};

export const OptimizedTextField = React.forwardRef<
  HTMLDivElement,
  OptimizedTextFieldProps
>(({ value, onChange, debounceMs = 0, ...props }, ref) => {
  const [localValue, setLocalValue] = useState(value?.toString() || "");

  useEffect(() => {
    setLocalValue(value?.toString() || "");
  }, [value]);

  useEffect(() => {
    if (debounceMs > 0) {
      const handler = setTimeout(() => {
        if (localValue !== value?.toString()) {
          onChange(localValue);
        }
      }, debounceMs);
      return () => clearTimeout(handler);
    }
  }, [localValue, debounceMs, value, onChange]);

  return (
    <TextField
      {...props}
      ref={ref}
      value={localValue}
      onChange={(e) => {
        setLocalValue(e.target.value);
      }}
      onBlur={(e) => {
        if (debounceMs === 0 && localValue !== value?.toString()) {
          onChange(localValue);
        }
        if (props.onBlur) {
          props.onBlur(e);
        }
      }}
    />
  );
});
