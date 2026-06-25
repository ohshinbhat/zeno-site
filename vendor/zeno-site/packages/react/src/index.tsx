import * as React from "react";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger";
type Variant = "solid" | "soft" | "outline" | "ghost" | "glass" | "raised" | "surface";
type Size = "$2" | "$3" | "$4" | "$5";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  circular?: boolean;
  tone?: Tone;
  variant?: Variant;
  size?: Size;
};

export function Button({ circular, className, variant = "solid", tone = "brand", size = "$3", ...props }: ButtonProps): React.ReactElement {
  return <button className={cx("inline-flex items-center justify-center gap-2 border px-3 font-semibold transition", circular ? "rounded-full px-0" : "rounded-lg", sizeClass(size), toneClass(tone, variant), className)} {...props} />;
}

Button.Text = function ButtonText({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>): React.ReactElement {
  return <span className={cx("truncate", className)} {...props} />;
};

Button.Icon = function ButtonIcon({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>): React.ReactElement {
  return <span className={cx("inline-flex shrink-0 items-center justify-center", className)} {...props} />;
};

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: Variant;
  interactive?: boolean;
};

export function Card({ className, variant = "surface", interactive, ...props }: CardProps): React.ReactElement {
  return <div className={cx("rounded-lg border border-border bg-surface text-text", variant === "raised" || variant === "glass" ? "shadow-elevated" : "", interactive ? "transition hover:-translate-y-0.5" : "", className)} {...props} />;
}

Card.Header = function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return <div className={cx("mb-4 flex items-start justify-between gap-3", className)} {...props} />;
};

Card.Content = function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return <div className={cx("min-w-0", className)} {...props} />;
};

Card.Footer = function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return <div className={cx("mt-4", className)} {...props} />;
};

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  description?: string;
  error?: string;
};

export function Input({ className, description, error, id, label, ...props }: InputProps): React.ReactElement {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <label className="grid min-w-0 gap-2">
      {label ? <span className="text-label font-medium text-text-muted">{label}</span> : null}
      <input id={inputId} className={cx("h-control-3 w-full rounded-lg border border-border bg-surface px-3 text-body text-text outline-none focus:shadow-focus", className)} {...props} />
      {error || description ? <span className={cx("text-label", error ? "text-danger" : "text-text-muted")}>{error ?? description}</span> : null}
    </label>
  );
}

type StackAlign = "baseline" | "center" | "end" | "flex-end" | "flex-start" | "start" | "stretch";
type StackDirection = "column" | "column-reverse" | "row" | "row-reverse";
type StackJustify = "between" | "center" | "end" | "flex-end" | "flex-start" | "space-around" | "space-between" | "space-evenly" | "start";

export type StackProps = Omit<React.HTMLAttributes<HTMLDivElement>, "style"> & {
  align?: StackAlign;
  direction?: StackDirection;
  gap?: Size | "none";
  justify?: StackJustify;
  wrap?: boolean;
};

export function Stack({ align, className, direction = "column", gap = "$3", justify, wrap, ...props }: StackProps): React.ReactElement {
  return <div className={cx("flex", directionClass(direction), alignClass(align), justifyClass(justify), wrap ? "flex-wrap" : "", gapClass(gap), className)} {...props} />;
}

export type TextProps = React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  htmlFor?: string;
  size?: "label" | "body" | "title" | "display";
  tone?: "default" | "muted" | "brand" | "success" | "danger";
  weight?: "medium" | "semibold" | "bold";
};

export function Text({ as, className, size = "body", tone = "default", weight, ...props }: TextProps): React.ReactElement {
  const Component = as ?? "span";
  return <Component className={cx(textSize(size), textTone(tone), textWeight(weight), "min-w-0", className)} {...props} />;
}

export const cn = cx;

function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

function sizeClass(size: Size): string {
  return {
    $2: "min-h-8 px-2 text-xs",
    $3: "min-h-10 px-3 text-sm",
    $4: "min-h-12 px-4 text-base",
    $5: "min-h-14 px-5 text-base"
  }[size];
}

function gapClass(gap: Size | "none"): string {
  return {
    none: "gap-0",
    $2: "gap-2",
    $3: "gap-3",
    $4: "gap-4",
    $5: "gap-5"
  }[gap];
}

function directionClass(direction: StackDirection): string {
  return {
    column: "flex-col",
    "column-reverse": "flex-col-reverse",
    row: "flex-row",
    "row-reverse": "flex-row-reverse"
  }[direction ?? "column"] ?? "flex-col";
}

function alignClass(align: StackAlign | undefined): string {
  if (!align) return "";
  return {
    center: "items-center",
    end: "items-end",
    "flex-end": "items-end",
    "flex-start": "items-start",
    start: "items-start",
    stretch: "items-stretch",
    baseline: "items-baseline"
  }[align] ?? "";
}

function justifyClass(justify: StackJustify | undefined): string {
  if (!justify) return "";
  return {
    between: "justify-between",
    center: "justify-center",
    end: "justify-end",
    "flex-end": "justify-end",
    "flex-start": "justify-start",
    "space-around": "justify-around",
    "space-between": "justify-between",
    "space-evenly": "justify-evenly",
    start: "justify-start"
  }[justify] ?? "";
}

function toneClass(tone: Tone, variant: Variant): string {
  if (variant === "outline") return "border-border bg-transparent text-text";
  if (variant === "ghost") return "border-transparent bg-transparent text-text";
  if (tone === "neutral") return "border-border bg-surface-raised text-text";
  return "border-brand bg-brand text-brand-contrast";
}

function textSize(size: NonNullable<TextProps["size"]>): string {
  return {
    label: "text-label",
    body: "text-body",
    title: "text-title",
    display: "text-display"
  }[size];
}

function textTone(tone: NonNullable<TextProps["tone"]>): string {
  return {
    default: "text-text",
    muted: "text-text-muted",
    brand: "text-brand",
    success: "text-success",
    danger: "text-danger"
  }[tone];
}

function textWeight(weight: TextProps["weight"]): string {
  return weight === "bold" ? "font-bold" : weight === "semibold" ? "font-semibold" : weight === "medium" ? "font-medium" : "";
}
