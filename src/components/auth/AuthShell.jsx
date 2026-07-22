import { Cpu, ShieldCheck, Truck, Headphones } from "lucide-react";
import Logo from "@/components/layout/Logo";

const points = [
  { Icon: Truck, text: "Fast delivery across Delhi-NCR" },
  { Icon: ShieldCheck, text: "100% genuine components" },
  { Icon: Headphones, text: "Real technical support" },
];

// Two-column authentication layout: brand panel + form card.
export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-brand-silver to-brand-bg">
      <div className="liquid-blob left-1/4 top-[-15%] h-96 w-96 bg-brand-blue/10" />
      <div className="liquid-blob right-[-10%] bottom-[-15%] h-96 w-96 bg-brand-navy/10" style={{ animationDelay: "-7s" }} />
      <div className="container-page relative py-10">
        <div className="grid overflow-hidden rounded-3xl glass-brand-strong lg:grid-cols-2">
          {/* Brand panel (hidden on small screens) */}
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-navy via-brand-blue to-brand-steel p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />
            <div className="relative">
              <Logo size={48} dark />
              <h2 className="mt-10 text-3xl font-extrabold leading-tight">
                Build anything.
                <br />
                <span className="bg-gradient-to-r from-white to-brand-silver bg-clip-text text-transparent">
                  We&apos;ve got the parts.
                </span>
              </h2>
              <p className="mt-4 max-w-sm text-white/60">
                Join 50,000+ makers shopping robotics, electronics and DIY
                engineering products on hardvanta.
              </p>
            </div>
            <ul className="relative mt-10 space-y-3">
              {points.map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-white/80">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg glass">
                    <Icon size={18} className="text-brand-silver" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
            <p className="relative mt-10 flex items-center gap-2 text-xs text-white/40">
              <Cpu size={14} /> A unit of Hardvanta Technologies LLP
            </p>
          </div>

          {/* Form panel */}
          <div className="p-8 sm:p-10">
            <div className="mx-auto w-full max-w-sm">
              <div className="lg:hidden">
                <Logo size={40} />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-brand-text lg:mt-0">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-sm text-brand-muted">{subtitle}</p>
              )}
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
