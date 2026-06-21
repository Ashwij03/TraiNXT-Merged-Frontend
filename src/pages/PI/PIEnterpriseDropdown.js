import React, { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiSearch } from "react-icons/fi";

function PIEnterpriseDropdown({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  searchable = true,
  className = "",
  ariaLabel = "Dropdown",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter((o) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      o.label.toLowerCase().includes(q) ||
      (o.subtitle && o.subtitle.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setOpen(false);
    setQuery("");
  };

  return (
    <div
      className={`pi-enterprise-dropdown ${className}${open ? " open" : ""}`}
      ref={ref}
    >
      <button
        type="button"
        className="pi-dropdown-trigger"
        onClick={() => setOpen(!open)}
        aria-label={ariaLabel}
        aria-expanded={open}
      >
        <span className="pi-dropdown-label">
          {selected ? selected.label : placeholder}
        </span>
        <FiChevronDown className="pi-dropdown-chevron" />
      </button>

      {open && (
        <div className="pi-dropdown-panel">
          {searchable && options.length > 4 && (
            <div className="pi-dropdown-search">
              <FiSearch />
              <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="pi-dropdown-options">
            {filtered.length === 0 ? (
              <div className="pi-dropdown-empty">No results found</div>
            ) : (
              filtered.map((option) => (
                <div
                  key={option.value}
                  className={`pi-dropdown-option${
                    option.value === value ? " selected" : ""
                  }`}
                  onClick={() => handleSelect(option.value)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleSelect(option.value)}
                >
                  <span className="pi-dropdown-option-label">{option.label}</span>
                  {option.subtitle && (
                    <span className="pi-dropdown-option-sub">{option.subtitle}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PIEnterpriseDropdown;
