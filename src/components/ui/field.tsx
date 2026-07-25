"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type FieldContextValue = {
  controlId: string;
  describedBy?: string;
  invalid: boolean;
};

const FieldContext = React.createContext<FieldContextValue | null>(null);

/**
 * Wires a control to its label, hint and error message so every form in the
 * app gets the same aria plumbing for free. Controls that call `useFieldProps`
 * (Input, Textarea, Select) pick up the id and aria-* attributes automatically;
 * anything else can read the context directly.
 */
export function useFieldProps() {
  const field = React.useContext(FieldContext);
  if (!field) return {};
  return {
    id: field.controlId,
    "aria-describedby": field.describedBy,
    "aria-invalid": field.invalid || undefined,
  };
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none text-foreground",
        className
      )}
      {...props}
    />
  );
}

/**
 * For controls that are not a single focusable input — a radiogroup, a set of
 * checkboxes. Uses a <span>, not a <label>, because there is no one element for
 * `htmlFor` to point at; the control carries its own accessible name.
 */
export function FieldSet({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <span className="block text-sm font-medium leading-none">{label}</span>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  optional,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const uid = React.useId();
  const controlId = `${uid}-control`;
  const hintId = `${uid}-hint`;
  const errorId = `${uid}-error`;

  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <FieldContext.Provider
      value={{ controlId, describedBy, invalid: Boolean(error) }}
    >
      <div className={cn("space-y-1.5", className)}>
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor={controlId}>{label}</Label>
          {optional && (
            <span className="text-xs text-muted-foreground">Optional</span>
          )}
        </div>
        {children}
        {hint && (
          <p id={hintId} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}
        {error && (
          <p
            id={errorId}
            className="text-xs font-medium text-danger-foreground"
          >
            {error}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
}
