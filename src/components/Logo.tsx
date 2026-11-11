import { Bot } from 'lucide-react';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2 select-none" aria-label="CODELAB">
      <div className="grid place-items-center w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-[0_4px_0_0_#6d28d9] -rotate-6">
        <Bot size={24} strokeWidth={2.5} />
      </div>
      {!compact && (
        <span className="font-display text-2xl tracking-wide leading-none">
          <span className="text-violet-700">CODE</span>
          <span className="text-fuchsia-500">LAB</span>
        </span>
      )}
    </div>
  );
}
