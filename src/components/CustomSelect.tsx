"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, Search } from "lucide-react";

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
  searchable?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "请选择...",
  disabled = false,
  className = "",
  searchable = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    const q = searchQuery.trim().toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, searchQuery, searchable]);

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

  // Reset search when closing & auto-focus when opening
  useEffect(() => {
    if (open) {
      if (searchable) {
        requestAnimationFrame(() => searchInputRef.current?.focus());
      }
    } else {
      setSearchQuery("");
    }
  }, [open, searchable]);

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
            overflow-hidden max-h-72 flex flex-col"
          style={{ animation: "scaleIn 0.15s ease-out forwards" }}
        >
          {/* Search input */}
          {searchable && (
            <div className="px-3 pt-2.5 pb-1.5 border-b border-border/30 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索..."
                  className="w-full rounded-lg border border-border/50 bg-muted/30 pl-8 pr-3 py-2 text-sm
                    placeholder:text-muted-foreground/60
                    focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/40
                    transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Options list */}
          <div className="overflow-y-auto py-1">
            {filteredOptions.map((opt) => {
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
            {filteredOptions.length === 0 && (
              <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                {searchable && searchQuery.trim() ? "无匹配选项" : "暂无选项"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

