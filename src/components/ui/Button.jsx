import clsx from "clsx";

const VARIANTS = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
  outline: "border border-zinc-300 text-zinc-800 hover:bg-zinc-50 disabled:opacity-50",
  ghost: "text-zinc-600 hover:text-zinc-900 disabled:opacity-50",
};

export default function Button({ variant = "primary", className, children, ...props }) {
  return (
    <button
      className={clsx(
        "inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed",
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
