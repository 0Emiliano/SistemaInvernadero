import React from 'react';

export function Panel({
  children,
  className = '',
  eyebrow,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  eyebrow?: string;
  title?: string;
}) {
  return (
    <section className={`rounded-xl border border-[#2A2A2A] bg-[#191919] p-5 shadow-2xl shadow-black/10 ${className}`}>
      {(eyebrow || title) && (
        <div className="mb-5">
          {eyebrow && <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{eyebrow}</p>}
          {title && <h3 className="mt-1 text-sm font-semibold text-zinc-100">{title}</h3>}
        </div>
      )}
      {children}
    </section>
  );
}
