import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

export function Label({ children }: { children: ReactNode }) {
  return (
    <span className="mb-1 block text-xs font-medium text-slate-muted">
      {children}
    </span>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-slate outline-none focus:border-indigo"
      {...props}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-slate outline-none focus:border-indigo"
      {...props}
    />
  );
}
