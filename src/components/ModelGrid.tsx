"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, Cpu, ArrowRight, Building2, ChevronDown, ChevronUp } from "lucide-react";

const PILL_COLLAPSE_LIMIT = 4;

export interface ModelItem {
  id: string;
  name: string;
  description: string | null;
  vendor_id: string;
  vendor_name: string;
  family_id: string;
  family_name: string;
  submission_count: string;
}

export default function ModelGrid({ models }: { models: ModelItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVendor, setActiveVendor] = useState("");
  const [activeFamily, setActiveFamily] = useState("");
  const [expandVendors, setExpandVendors] = useState(false);
  const [expandFamilies, setExpandFamilies] = useState(false);

  // Extract unique vendors (preserving SQL sort_order)
  const vendors = useMemo(() => {
    const map = new Map<string, string>();
    models.forEach((m) => {
      if (!map.has(m.vendor_id)) map.set(m.vendor_id, m.vendor_name);
    });
    return Array.from(map.entries());
  }, [models]);

  // Extract unique families, optionally filtered by active vendor
  const families = useMemo(() => {
    const source = activeVendor
      ? models.filter((m) => m.vendor_id === activeVendor)
      : models;
    const map = new Map<string, string>();
    source.forEach((m) => {
      if (!map.has(m.family_id)) map.set(m.family_id, m.family_name);
    });
    return Array.from(map.entries());
  }, [models, activeVendor]);

  // When vendor changes, reset family if it no longer exists in the new vendor scope
  const handleVendorChange = (vendorId: string) => {
    setActiveVendor(vendorId);
    setExpandFamilies(false);
    if (vendorId) {
      const familiesInVendor = models
        .filter((m) => m.vendor_id === vendorId)
        .map((m) => m.family_id);
      if (!familiesInVendor.includes(activeFamily)) {
        setActiveFamily("");
      }
    }
  };

  // Filtered models
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return models.filter((m) => {
      if (activeVendor && m.vendor_id !== activeVendor) return false;
      if (activeFamily && m.family_id !== activeFamily) return false;
      if (q) {
        const haystack = `${m.name} ${m.vendor_name} ${m.family_name}`.toLowerCase();
        return haystack.includes(q);
      }
      return true;
    });
  }, [models, searchQuery, activeVendor, activeFamily]);

  const hasActiveFilters = searchQuery || activeVendor || activeFamily;

  const clearAll = () => {
    setSearchQuery("");
    setActiveVendor("");
    setActiveFamily("");
  };

  const visibleVendors = expandVendors ? vendors : vendors.slice(0, PILL_COLLAPSE_LIMIT);
  const vendorsCollapsible = vendors.length > PILL_COLLAPSE_LIMIT;
  const visibleFamilies = expandFamilies ? families : families.slice(0, PILL_COLLAPSE_LIMIT);
  const familiesCollapsible = families.length > PILL_COLLAPSE_LIMIT;

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          className="input !pl-11 !pr-9"
          placeholder="搜索模型、产品线、厂商..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center
                       text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Vendor pills */}
      {vendors.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-bold mr-1">厂商</span>
          <button
            onClick={() => handleVendorChange("")}
            className={`h-8 px-4 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer
              ${!activeVendor
                ? "bg-primary text-primary-foreground shadow-soft"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
          >
            全部
          </button>
          {visibleVendors.map(([id, name]) => (
            <button
              key={id}
              onClick={() => handleVendorChange(id === activeVendor ? "" : id)}
              className={`h-8 px-4 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer
                ${activeVendor === id
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              {name}
            </button>
          ))}
          {vendorsCollapsible && (
            <button
              onClick={() => setExpandVendors(!expandVendors)}
              className="h-8 px-3 rounded-full text-xs font-bold text-muted-foreground bg-muted/50
                         hover:text-foreground hover:bg-muted transition-all duration-200 cursor-pointer inline-flex items-center gap-1"
            >
              {expandVendors ? (
                <><ChevronUp className="h-3.5 w-3.5" />收起</>
              ) : (
                <><ChevronDown className="h-3.5 w-3.5" />展开 +{vendors.length - PILL_COLLAPSE_LIMIT}</>
              )}
            </button>
          )}
        </div>
      )}

      {/* Family pills */}
      {families.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-bold mr-1">产品线</span>
          <button
            onClick={() => setActiveFamily("")}
            className={`h-8 px-4 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer
              ${!activeFamily
                ? "bg-secondary text-secondary-foreground shadow-soft"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
          >
            全部
          </button>
          {visibleFamilies.map(([id, name]) => (
            <button
              key={id}
              onClick={() => setActiveFamily(id === activeFamily ? "" : id)}
              className={`h-8 px-4 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer
                ${activeFamily === id
                  ? "bg-secondary text-secondary-foreground shadow-soft"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              {name}
            </button>
          ))}
          {familiesCollapsible && (
            <button
              onClick={() => setExpandFamilies(!expandFamilies)}
              className="h-8 px-3 rounded-full text-xs font-bold text-muted-foreground bg-muted/50
                         hover:text-foreground hover:bg-muted transition-all duration-200 cursor-pointer inline-flex items-center gap-1"
            >
              {expandFamilies ? (
                <><ChevronUp className="h-3.5 w-3.5" />收起</>
              ) : (
                <><ChevronDown className="h-3.5 w-3.5" />展开 +{families.length - PILL_COLLAPSE_LIMIT}</>
              )}
            </button>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="text-sm text-muted-foreground">
        {hasActiveFilters ? (
          <span>
            筛选出 <strong className="text-foreground">{filtered.length}</strong> / {models.length} 个模型
            <button onClick={clearAll} className="ml-3 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 cursor-pointer">
              清除筛选
            </button>
          </span>
        ) : (
          <span>共 <strong className="text-foreground">{models.length}</strong> 个模型</span>
        )}
      </div>

      {/* Model card grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-muted-foreground mb-3">无匹配模型</p>
          {hasActiveFilters && (
            <button onClick={clearAll} className="btn-ghost btn-sm text-xs cursor-pointer">
              清除筛选
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((m) => (
            <Link
              key={m.id}
              href={`/models/${m.id}`}
              className="card card-hover p-6 group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors duration-300">
                  <Cpu className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg group-hover:text-primary transition-colors">
                    {m.name}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {m.vendor_name} · {m.family_name}
                  </p>
                </div>
              </div>
              {m.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {m.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="badge-primary">
                  {m.submission_count} 个作品
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
