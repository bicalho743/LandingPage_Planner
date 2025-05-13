import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin border-4 border-t-transparent rounded-full",
        className
      )}
      {...props}
      aria-label="Carregando"
    />
  );
}