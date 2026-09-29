import type { ComponentProps } from "react";

type InputProps = ComponentProps<"input">;

function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-primary/20 px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${className}`}
    />
  );
}

export default Input;
