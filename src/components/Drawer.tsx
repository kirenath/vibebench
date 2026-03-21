"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}

export default function Drawer({
  open,
  onClose,
  title,
  children,
  wide = false,
}: DrawerProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] pb-[5vh] px-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal panel */}
      <div
        ref={contentRef}
        className={`relative ${wide ? "max-w-2xl" : "max-w-lg"} w-full bg-card border border-border/50
          rounded-[2rem] shadow-float overflow-hidden flex flex-col max-h-[90vh]`}
        style={{ animation: "scaleIn 0.2s ease-out forwards" }}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border/50 px-6 py-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="btn-ghost !h-9 !w-9 !p-0 !rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
