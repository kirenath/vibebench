"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "请选择...",
  disabled = false,
  className = "",
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`w-full rounded-full border border-border bg-white/50 px-5 h-12 text-sm font-body
          text-left flex items-center justify-between gap-2
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2
          transition-all duration-300
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/40"}
          ${open ? "ring-2 ring-primary/30 ring-offset-2" : ""}
          ${!selectedLabel ? "text-muted-foreground" : "text-foreground"}`}
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute z-50 mt-2 w-full bg-card border border-border/50 rounded-2xl shadow-float
            overflow-hidden py-1 max-h-60 overflow-y-auto"
          style={{ animation: "scaleIn 0.15s ease-out forwards" }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between
                  transition-colors duration-150
                  ${
                    isSelected
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted/50"
                  }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="h-4 w-4 flex-shrink-0 text-primary" />}
              </button>
            );
          })}
          {options.length === 0 && (
            <div className="px-4 py-3 text-sm text-muted-foreground text-center">
              暂无选项
            </div>
          )}
        </div>
      )}
    </div>
  );
}
