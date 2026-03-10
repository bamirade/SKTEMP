import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, style, value, defaultValue, ...props }, ref) => {
    const supportsAutoTextResize =
      !type || ["text", "search", "email", "tel", "url", "password"].includes(type)
    const inputValue =
      typeof value === "string"
        ? value
        : typeof defaultValue === "string"
          ? defaultValue
          : ""
    const valueLength = inputValue.trim().length

    let autoFontSize: React.CSSProperties["fontSize"]
    if (supportsAutoTextResize) {
      if (valueLength >= 40) autoFontSize = "0.72rem"
      else if (valueLength >= 32) autoFontSize = "0.78rem"
      else if (valueLength >= 24) autoFontSize = "0.84rem"
    }

    const mergedStyle: React.CSSProperties | undefined = style?.fontSize
      ? style
      : autoFontSize
        ? { ...style, fontSize: autoFontSize }
        : style

    // h-9 to match icon buttons and default buttons.
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        style={mergedStyle}
        value={value}
        defaultValue={defaultValue}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
