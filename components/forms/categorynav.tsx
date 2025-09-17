"use client";

import React from "react";

type Props = {
  categories: { title: string }[];
  activeIndex: number;
  onSelect: (idx: number) => void;
};

export default function CategoryNav({ categories, activeIndex, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {categories.map((c, i) => {
        const active = i === activeIndex;
        return (
          <button
            key={c.title}
            type="button"
            onClick={() => onSelect(i)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors
              ${
                active
                  ? "bg-[#005C8B] text-white shadow-md"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
          >
            {c.title}
          </button>
        );
      })}
    </div>
  );
}
