"use client";

import { forwardRef, useRef, useState, useCallback } from "react";
import Link from "next/link";

let rippleId = 0;

const Button = forwardRef(function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  onMouseMove,
  onMouseLeave,
  style,
  href,
  ...props
}, forwardedRef) {
  const innerRef = useRef(null);
  const ref = (node) => {
    innerRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };
  const [ripples, setRipples] = useState([]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const base =
    "relative inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric/50 overflow-hidden";

  const variants = {
    // Danger/error semantic (destructive confirms, add-to-cart error state) — not a generic "primary" look.
    primary:
      "bg-red-500 text-white shadow-sm hover:bg-red-600 hover:shadow-[0_0_40px_-8px_rgba(248,113,113,0.45)]",
    secondary:
      "bg-liquid text-white shadow-sm hover:bg-liquid-dark hover:shadow-glow-purple",
    outline:
      "border border-electric/40 bg-transparent text-white hover:border-electric hover:bg-white/5",
    ghost: "text-white/70 hover:bg-white/10 hover:text-white",
    glass:
      "glass text-white hover:border-white/25 hover:shadow-glow-electric",
    gradient:
      "gradient-mesh bg-gradient-to-r from-electric via-liquid to-cyan bg-[length:200%_100%] text-white shadow-glow-electric hover:shadow-glow-purple",
    // HV Kart brand variants — storefront only, kept separate from the
    // variants above so /admin (which still uses "gradient"/"glass") is unaffected.
    "brand-gradient":
      "gradient-mesh bg-gradient-to-r from-brand-blue via-brand-navy to-brand-steel bg-[length:200%_100%] text-white shadow-brand-glow hover:brightness-110",
    "brand-glass":
      "glass-brand text-brand-text hover:border-brand-blue/40 hover:shadow-brand-glow",
    "brand-outline":
      "border border-brand-blue/40 bg-transparent text-brand-blue hover:border-brand-blue hover:bg-brand-blue/5",
    "brand-ghost": "text-brand-muted hover:bg-brand-silver hover:text-brand-text",
    "brand-secondary":
      "bg-brand-steel text-white shadow-sm hover:bg-brand-navy hover:shadow-brand-glow",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-base",
  };

  const handleClick = useCallback(
    (e) => {
      const el = innerRef.current;
      if (el && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const id = ++rippleId;
        setRipples((r) => [
          ...r,
          {
            id,
            size,
            x: e.clientX - rect.left - size / 2,
            y: e.clientY - rect.top - size / 2,
          },
        ]);
        setTimeout(() => {
          setRipples((r) => r.filter((rp) => rp.id !== id));
        }, 650);
      }
      onClick?.(e);
    },
    [onClick]
  );

  const handleMouseMove = useCallback(
    (e) => {
      const el = innerRef.current;
      if (el && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        const rect = el.getBoundingClientRect();
        const relX = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const relY = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setTilt({ x: relX * 6, y: relY * 6 });
      }
      onMouseMove?.(e);
    },
    [onMouseMove]
  );

  const handleMouseLeave = useCallback(
    (e) => {
      setTilt({ x: 0, y: 0 });
      onMouseLeave?.(e);
    },
    [onMouseLeave]
  );

  const Tag = href ? Link : "button";
  const tagProps = href ? { href } : {};

  return (
    <Tag
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate(${tilt.x}px, ${tilt.y}px)`,
        ...style,
      }}
      {...tagProps}
      {...props}
    >
      {children}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute rounded-full bg-white/40 animate-ripple"
          style={{
            width: r.size,
            height: r.size,
            left: r.x,
            top: r.y,
          }}
        />
      ))}
    </Tag>
  );
});

export default Button;
