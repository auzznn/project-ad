import React from "react";
import "./FilterDropdown.css";

interface Option {
  value: string | number;
  label: string;
}

interface FilterDropdownProps {
  label?: string;
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  disabled?: boolean;
}

export default function FilterDropdown({
  label,
  options,
  value,
  onChange,
  disabled = false,
}: FilterDropdownProps) {
  return (
    <div className="filter-dropdown">
      {label && <span className="filter-label">{label}</span>}
      <select
        className="filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
