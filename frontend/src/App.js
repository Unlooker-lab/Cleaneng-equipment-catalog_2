import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import axios from "axios";
import { LayoutGrid, Grid3X3, List, ChevronRight, X, ArrowLeft, ArrowRight, Loader2, SlidersHorizontal } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ProductCard from "@/components/ProductCard";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import Configurator from "@/components/Configurator";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BRANDS_DISPLAY = [
  { name: "TOR", color: "#1D5EBC" },
  { name: "Annovi Reverberi", color: "#333" },
  { name: "HAWK", color: "#C41E3A" },
  { name: "RM Suttner", color: "#2D5F2D" },
  { name: "Christ AG", color: "#0066CC" },
  { name: "CTW Cleaning", color: "#FF8C00" },
  { name: "Groninger", color: "#444" },
];

function Breadcrumbs({ categories, activeCategory }) {
  const activeCat = categories.find((c) => c.id === activeCategory);
  const parentCat = activeCat?.parent_id ? categories.find((c) => c.id === activeCat.parent_id) : null;
  return (
    <nav className="flex items-center gap-1.5 py-4 text-sm" data-testid="breadcrumbs">
      <a href="/" className="text-slate-500 hover:text-[#1D5EBC] transition-colors">Главная</a>
      <ChevronRight size={14} className="text-slate-400" />
      <span className={activeCategory ? "text-slate-500 hover:text-[#1D5EBC] cursor-pointer transition-colors" : "text-slate-900 font-medium"}>Каталог</span>
      {parentCat && (<><ChevronRight size={14} className="text-slate-400" /><span className="text-slate-500">{parentCat.name}</span></>)}
      {activeCat && (<><ChevronRight size={14} className="text-slate-400" /><span className="text-slate-900 font-medium">{activeCat.name}</span></>)}
    </nav>
  );
}

function ActiveTags({ filters, activeCategory, categories, onRemoveFilter, onClearCategory }) {
  const tags = [];
  if (activeCategory) {
    const cat = categories.find((c) => c.id === activeCategory);
    if (cat) tags.push({ key: "category", label: cat.name, onRemove: onClearCategory });
  }
  filters.brands.forEach((b) => tags.push({ key: `brand-${b}`, label: b, onRemove: () => onRemoveFilter("brands", b) }));
  filters.pressures.forEach((p) => tags.push({ key: `pressure-${p}`, label: `${p} бар`, onRemove: () => onRemoveFilter("pressures", p) }));
  filters.flows.forEach((f) => tags.push({ key: `flow-${f}`, label: `${f} л/мин`, onRemove: () => onRemoveFilter("flows", f) }));
  if (filters.priceMin) tags.push({ key: "priceMin", label: `от ${filters.priceMin} Br`, onRemove: () => onRemoveFilter("priceMin") });
  if (filters.priceMax) tags.push({ key: "priceMax", label: `до ${filters.priceMax} Br`, onRemove: () => onRemoveFilter("priceMax") });
  if (filters.search) tags.push({ key: "search", label: `"${filters.search}"`, onRemove: () => onRemoveFilter("search") });

  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mb-4" data-testid="active-tags">
      {tags.map((t) => (
        <span key={t.key} className="tag-chip">
          {t.label}
          <button onClick={t.onRemove} data-testid={`remove-tag-${t.key}`}><X size={12} /></button>
        </span>
      ))}
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }
  return (
    <div className="flex items-center justify-center gap-1.5 mt-8" data-testid="pagination">
      <button className="page-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)} data-testid="page-prev"><ArrowLeft size={14} /></button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-1 text-slate-400">...</span>
        ) : (
          <button key={p} className={`page-btn ${p === page ? "active" : ""}`} onClick={() => onPageChange(p)} data-testid={`page-${p}`}>{p}</button>
        )
      )}
      <button className="page-btn" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} data-testid="page-next"><ArrowRight size={14} /></button>
    </div>
  );
}

function SortBar({ sort, onSortChange, viewMode, onViewModeChange, total }) {
  return (
    <div className="flex items-center justify-between mb-5 flex-wrap gap-3" data-testid="sort-bar">
      <p className="text-sm text-slate-500">
        Найдено: <span className="font-semibold text-slate-700">{total}</span> товаров
      </p>
      <div className="flex items-center gap-3">
        <select
          data-testid="sort-select"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="h-8 px-3 text-sm border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1D5EBC] cursor-pointer"
        >
          <option value="default">По умолчанию</option>
          <option value="price_asc">Сначала дешёвые</option>
          <option value="price_desc">Сначала дорогие</option>
          <option value="name_asc">По имени (А-Я)</option>
          <option value="name_desc">По имени (Я-А)</option>
          <option value="new">Новинки</option>
        </select>
        <div className="flex items-center border border-slate-200 rounded-md overflow-hidden">
          {[
            { mode: "grid", icon: LayoutGrid, label: "Сетка" },
            { mode: "compact", icon: Grid3X3, label: "Компактная" },
            { mode: "list", icon: List, label: "Список" },
          ].map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              data-testid={`view-${mode}`}
              onClick={() => onViewModeChange(mode)}
              title={label}
              className={`p-1.5 transition-colors ${viewMode === mode ? "bg-[#1D5EBC] text-white" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function NewArrivals({ products }) {
  if (!products || products.length === 0) return null;
  return (
    <section className="mt-16 mb-8" data-testid="new-arrivals-section">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Новинки каталога</h2>
        <div className="h-px flex-1 ml-6 bg-slate-200" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {products.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} viewMode="grid" />
        ))}
      </div>
    </section>
  );
}

function Partners() {
  return (
    <section className="mt-16 mb-8" data-testid="partners-section">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Наши партнёры</h2>
        <div className="h-px flex-1 ml-6 bg-slate-200" />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
        {BRANDS_DISPLAY.map((b) => (
          <div key={b.name} className="brand-logo flex items-center justify-center h-16 px-6 border border-slate-200 rounded-lg bg-white hover:shadow-md transition-shadow cursor-pointer" data-testid={`partner-${b.name}`}>
            <span className="text-lg font-bold tracking-tight" style={{ color: b.color }}>{b.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filterRanges, setFilterRanges] = useState(null);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const [showContact, setShowContact] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [filters, setFilters] = useState({
    brands: [], priceMin: "", priceMax: "", pressures: [], flows: [], sort: "default", search: "",
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory) params.append("category", activeCategory);
      if (filters.brands.length) params.append("brand", filters.brands.join(","));
      if (filters.priceMin) params.append("price_min", filters.priceMin);
      if (filters.priceMax) params.append("price_max", filters.priceMax);
      if (filters.pressures.length) params.append("pressure", filters.pressures.join(","));
      if (filters.flows.length) params.append("flow", filters.flows.join(","));
      if (filters.sort !== "default") params.append("sort", filters.sort);
      if (filters.search) params.append("search", filters.search);
      params.append("page", page);
      params.append("limit", 12);
      const { data } = await axios.get(`${API}/products?${params.toString()}`);
      setProducts(data.products);
      setTotal(data.total);
      setTotalPages(data.pages);
    } catch (e) {
      console.error("Failed to fetch products:", e);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, filters, page]);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/categories`).then((r) => setCategories(r.data.categories)),
      axios.get(`${API}/brands`).then((r) => setBrands(r.data.brands)),
      axios.get(`${API}/filters/ranges`).then((r) => setFilterRanges(r.data)),
      axios.get(`${API}/products/new`).then((r) => setNewProducts(r.data.products)),
    ]).catch((e) => console.error("Failed to load initial data:", e));
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearch = (val) => {
    setFilters((f) => ({ ...f, search: val }));
    setPage(1);
  };

  const toggleArrayFilter = (key, val) => {
    setFilters((f) => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter((v) => v !== val) : [...f[key], val],
    }));
    setPage(1);
  };

  const handlePriceChange = (key, val) => {
    setFilters((f) => ({ ...f, [key]: val }));
    setPage(1);
  };

  const handleRemoveFilter = (key, val) => {
    if (key === "priceMin" || key === "priceMax" || key === "search") {
      setFilters((f) => ({ ...f, [key]: "" }));
    } else {
      setFilters((f) => ({ ...f, [key]: f[key].filter((v) => v !== val) }));
    }
    setPage(1);
  };

  const handleReset = () => {
    setFilters({ brands: [], priceMin: "", priceMax: "", pressures: [], flows: [], sort: "default", search: "" });
    setActiveCategory(null);
    setPage(1);
  };

  const hasFilters = activeCategory || filters.brands.length || filters.priceMin || filters.priceMax || filters.pressures.length || filters.flows.length || filters.search;

  const sidebarProps = {
    categories, activeCategory, onCategorySelect: (id) => { setActiveCategory(id); setPage(1); },
    brands, selectedBrands: filters.brands, onBrandToggle: (b) => toggleArrayFilter("brands", b),
    priceMin: filters.priceMin, priceMax: filters.priceMax, onPriceChange: handlePriceChange, ranges: filterRanges,
    pressures: filterRanges?.pressures || [], selectedPressures: filters.pressures, onPressureToggle: (p) => toggleArrayFilter("pressures", p),
    flows: filterRanges?.flows || [], selectedFlows: filters.flows, onFlowToggle: (f) => toggleArrayFilter("flows", f),
    onReset: handleReset, hasFilters,
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header onSearch={handleSearch} onContactOpen={() => setShowContact(true)} searchValue={filters.search} />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <Breadcrumbs categories={categories} activeCategory={activeCategory} />

          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight" data-testid="catalog-title">
              {activeCategory ? categories.find((c) => c.id === activeCategory)?.name || "Каталог" : "Каталог оборудования"}
            </h1>
            <button
              data-testid="mobile-filter-toggle"
              onClick={() => setMobileSidebar(true)}
              className="lg:hidden flex items-center gap-1.5 h-8 px-3 border border-slate-200 rounded-md text-sm text-slate-600"
            >
              <SlidersHorizontal size={15} />Фильтры
            </button>
          </div>

          <ActiveTags filters={filters} activeCategory={activeCategory} categories={categories} onRemoveFilter={handleRemoveFilter} onClearCategory={() => { setActiveCategory(null); setPage(1); }} />

          <div className="flex gap-8 items-start">
            <div className="hidden lg:block">
              <Sidebar {...sidebarProps} />
            </div>

            <div className="flex-1 min-w-0">
              <SortBar sort={filters.sort} onSortChange={(s) => { setFilters((f) => ({ ...f, sort: s })); setPage(1); }} viewMode={viewMode} onViewModeChange={setViewMode} total={total} />

              {loading ? (
                <div className="flex items-center justify-center py-20" data-testid="loading-spinner">
                  <Loader2 size={32} className="animate-spin text-[#1D5EBC]" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20" data-testid="no-products">
                  <p className="text-lg text-slate-400">Товары не найдены</p>
                  <p className="text-sm text-slate-400 mt-1">Попробуйте изменить параметры фильтра</p>
                  {hasFilters && (
                    <button onClick={handleReset} className="mt-4 h-9 px-5 bg-[#1D5EBC] text-white text-sm rounded-lg" data-testid="reset-filters-empty">
                      Сбросить фильтры
                    </button>
                  )}
                </div>
              ) : (
                <div className={viewMode === "list" ? "product-list-view" : viewMode === "compact" ? "product-compact-view" : "product-grid-view"} data-testid="product-grid">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} viewMode={viewMode} />
                  ))}
                </div>
              )}

              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>

          <NewArrivals products={newProducts} />
        </div>

        <Configurator />

        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <Partners />
        </div>
      </main>

      <Footer />

      {showContact && <ContactForm onClose={() => setShowContact(false)} />}

      {mobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileSidebar(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Фильтры</h3>
              <button onClick={() => setMobileSidebar(false)} className="p-1 text-slate-400" data-testid="close-mobile-sidebar"><X size={20} /></button>
            </div>
            <Sidebar {...sidebarProps} />
          </div>
        </div>
      )}
    </div>
  );
}
