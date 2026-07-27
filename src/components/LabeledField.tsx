"use client";

import * as React from "react";
import { useId } from "react";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

/**
 * A `Field` with a label, hint, optional marker, and optional tooltip — the
 * convenience API the stock shadcn `Field` doesn't carry. Composes `FieldLabel`
 * and `FieldDescription` inside a stock `Field`, so `ui/field.tsx` stays
 * untouched.
 */
export function LabeledField({
  label,
  hint,
  tooltip,
  optional,
  children,
  className,
  ...props
}: {
  label: string;
  hint?: string;
  tooltip?: string;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
} & Omit<React.ComponentProps<typeof Field>, "children">) {
  const generatedId = useId();
  const controlId = `field-${generatedId}`;
  const childrenArray = React.Children.toArray(children);
  const existingId =
    childrenArray.length === 1 && React.isValidElement(childrenArray[0])
      ? (childrenArray[0] as React.ReactElement<{ id?: string }>).props.id
      : undefined;
  const actualControlId = existingId ?? controlId;
  const descriptionId = hint ? `${actualControlId}-description` : undefined;
  const control =
    childrenArray.length === 1 && React.isValidElement(childrenArray[0])
      ? React.cloneElement(
          childrenArray[0] as React.ReactElement<{
            id?: string;
            "aria-describedby"?: string;
          }>,
          {
            id: actualControlId,
            "aria-describedby": [
              (childrenArray[0] as React.ReactElement<{
                "aria-describedby"?: string;
              }>).props["aria-describedby"],
              descriptionId,
            ]
              .filter(Boolean)
              .join(" ") || undefined,
          }
        )
      : children;

  return (
    <Field className={className} {...props}>
      <div className="flex w-fit items-center gap-1">
        <FieldLabel htmlFor={actualControlId}>
          {label}
          {optional && (
            <span className="text-muted-foreground font-normal">
              {" "}
              (optional)
            </span>
          )}
        </FieldLabel>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    className="-my-2 grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={`More about ${label}`}
                  />
                }
              >
                <InfoIcon className="size-3.5" aria-hidden="true" />
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {control}
      {hint && <FieldDescription id={descriptionId}>{hint}</FieldDescription>}
    </Field>
  );
}

/**
 * A `FieldSet` with a legend and optional hint. The stock shadcn `FieldSet` is
 * a bare `<fieldset>`; this wrapper adds a `FieldLegend` so callers can pass
 * `label` and `hint` as props.
 */
export function LabeledFieldSet({
  label,
  hint,
  children,
  className,
  ...props
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
} & Omit<React.ComponentProps<typeof FieldSet>, "children">) {
  return (
    <FieldSet className={className} {...props}>
      <FieldLegend variant="label">{label}</FieldLegend>
      {hint && <FieldDescription>{hint}</FieldDescription>}
      {children}
    </FieldSet>
  );
}

// Re-export so callers can import both from one place.
export { FieldDescription } from "@/components/ui/field";
