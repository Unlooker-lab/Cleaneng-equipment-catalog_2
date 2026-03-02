import { useState } from "react";
import { ChevronDown, ChevronRight, RotateCcw } from "lucide-react";

function CategoryTree({ categories, activeCategory, onCategorySelect }) {
  const [expanded, setExpanded] = useState({});
  const parents = categories.filter((c) => !c.parent_id);

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const getChildren = (parentId) => categories.filter((c) => c.parent_id === parentId);

  return (
    <div className="filter-section">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Категории</h3>
      <ul className="space-y-0.5">
        {parents.map((cat) => {
          const children = getChildren(cat.id);
          const isOpen = expanded[cat.id];
          const isActive = activeCategory === cat.id;

          return (
            <li key={cat.id}>
              <div className="flex items-center">
                {children.length > 0 && (
                  <button onClick={() => toggle(cat.id)} className="p-1 text-slate-400 hover:text-slate-600" data-testid={`cat-expand-${cat.slug}`}>
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                )}
                <button
                  data-testid={`cat-select-${cat.slug}`}
                  onClick={() => onCategorySelect(isActive ? null : cat.id)}
                  className={`flex-1 text-left text-sm py-1.5 px-2 rounded-md transition-colors ${
                    isActive ? "bg-[#1D5EBC] text-white font-medium" : "text-slate-700 hover:bg-slate-100"
                  } ${children.length === 0 ? "ml-6" : ""}`}
                >
                  {cat.name}
                  <span className={`ml-1 text-xs ${isActive ? "text-blue-200" : "text-slate-400"}`}>({cat.count})</span>
                </button>
              </div>
              {isOpen && children.length > 0 && (
                <ul className="ml-5 mt-0.5 space-y-0.5">
                  {children.map((child) => {
                    const childActive = activeCategory === child.id;
                    return (
                      <li key={child.id}>
                        <button
                          data-testid={`cat-select-${child.slug}`}
                          onClick={() => onCategorySelect(childActive ? null : child.id)}
                          className={`w-full text-left text-sm py-1.5 px-2 rounded-md transition-colors ${
                            childActive ? "bg-[#1D5EBC] text-white font-medium" : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {child.name}
                          <span className={`ml-1 text-xs ${childActive ? "text-blue-200" : "text-slate-400"}`}>({child.count})</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PriceFilter({ priceMin, priceMax, onPriceChange, ranges }) {
  return (
    <div className="filter-section">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Цена (Br)</h3>
      <div className="flex items-center gap-2">
        <input
          data-testid="price-min-input"
          type="number"
          placeholder={ranges?.price_min ? `от ${Math.floor(ranges.price_min)}` : "от"}
          value={priceMin}
          onChange={(e) => onPriceChange("priceMin", e.target.value)}
          className="w-full h-8 px-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1D5EBC] bg-white"
        />
        <span className="text-slate-400 text-xs shrink-0">-</span>
        <input
          data-testid="price-max-input"
          type="number"
          placeholder={ranges?.price_max ? `до ${Math.ceil(ranges.price_max)}` : "до"}
          value={priceMax}
          onChange={(e) => onPriceChange("priceMax", e.target.value)}
          className="w-full h-8 px-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1D5EBC] bg-white"
        />
      </div>
    </div>
  );
}

function CheckboxFilter({ title, options, selected, onChange, testIdPrefix }) {
  if (!options || options.length === 0) return null;
  return (
    <div className="filter-section">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">{title}</h3>
      <div className="space-y-2">
        {options.map((opt) => {
          const val = typeof opt === "object" ? opt.value : opt;
          const label = typeof opt === "object" ? opt.label : String(opt);
          const checked = selected.includes(val);
          return (
            <label key={val} className="flex items-center gap-2.5 cursor-pointer group" data-testid={`${testIdPrefix}-${val}`}>
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                checked ? "bg-[#1D5EBC] border-[#1D5EBC]" : "border-slate-300 group-hover:border-slate-400"
              }`}>
                {checked && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <input type="checkbox" className="hidden" checked={checked} onChange={() => onChange(val)} />
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function Sidebar({
  categories, activeCategory, onCategorySelect,
  brands, selectedBrands, onBrandToggle,
  priceMin, priceMax, onPriceChange, ranges,
  pressures, selectedPressures, onPressureToggle,
  flows, selectedFlows, onFlowToggle,
  onReset, hasFilters,
}) {
  return (
    <aside className="w-full lg:w-72 shrink-0" data-testid="sidebar">
      <div className="sidebar-sticky bg-white border border-slate-200 rounded-xl p-4">
        {hasFilters && (
          <button data-testid="reset-filters-btn" onClick={onReset} className="flex items-center gap-1.5 text-xs font-medium text-[#1D5EBC] hover:text-[#164B96] mb-4 transition-colors">
            <RotateCcw size={13} />
            Сбросить фильтры
          </button>
        )}

        <CategoryTree categories={categories} activeCategory={activeCategory} onCategorySelect={onCategorySelect} />

        <PriceFilter priceMin={priceMin} priceMax={priceMax} onPriceChange={onPriceChange} ranges={ranges} />

        <CheckboxFilter
          title="Бренд"
          options={brands.map((b) => ({ value: b, label: b }))}
          selected={selectedBrands}
          onChange={onBrandToggle}
          testIdPrefix="brand-filter"
        />

        <CheckboxFilter
          title="Давление (бар)"
          options={pressures.map((p) => ({ value: p, label: `${p} бар` }))}
          selected={selectedPressures}
          onChange={onPressureToggle}
          testIdPrefix="pressure-filter"
        />

        <CheckboxFilter
          title="Поток (л/мин)"
          options={flows.map((f) => ({ value: f, label: `${f} л/мин` }))}
          selected={selectedFlows}
          onChange={onFlowToggle}
          testIdPrefix="flow-filter"
        />
      </div>
    </aside>
  );
}
