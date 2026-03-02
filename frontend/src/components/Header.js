import { useState } from "react";
import { Search, Phone, Menu, X, MessageSquare } from "lucide-react";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_washtech-solutions/artifacts/y2cyxval_Logo_new_AVDIRVD_2.jpeg";

export default function Header({ onSearch, onContactOpen, searchValue }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchValue || "");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(localSearch);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="bg-[#0F172A] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between h-8">
          <span className="text-slate-400">Пн-Пт: 9:00 - 18:00 | Сб: 10:00 - 15:00</span>
          <a href="tel:+375291234567" className="flex items-center gap-1.5 text-white hover:text-blue-300 transition-colors" data-testid="header-phone-link">
            <Phone size={12} />
            <span>+375 (29) 123-45-67</span>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between h-16 gap-4">
        <a href="/" className="shrink-0" data-testid="header-logo">
          <img src={LOGO_URL} alt="AVDIRVD" className="h-10 w-auto" />
        </a>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700" data-testid="main-nav">
          {["Главная", "Каталог", "О компании", "Доставка", "Контакты"].map((item) => (
            <a key={item} href="/" className="hover:text-[#1D5EBC] transition-colors">{item}</a>
          ))}
        </nav>

        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-xs">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              data-testid="header-search-input"
              type="text"
              placeholder="Поиск по каталогу..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1D5EBC] focus:border-transparent transition-shadow"
            />
          </div>
        </form>

        <button
          data-testid="header-contact-btn"
          onClick={onContactOpen}
          className="hidden md:inline-flex items-center gap-2 h-9 px-5 bg-[#1D5EBC] hover:bg-[#164B96] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <MessageSquare size={15} />
          Оставить заявку
        </button>

        <button
          data-testid="mobile-menu-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 text-slate-600"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pb-4">
          <nav className="flex flex-col gap-3 py-3 text-sm font-medium text-slate-700">
            {["Главная", "Каталог", "О компании", "Доставка", "Контакты"].map((item) => (
              <a key={item} href="/" className="hover:text-[#1D5EBC]">{item}</a>
            ))}
          </nav>
          <form onSubmit={handleSearchSubmit} className="mt-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" placeholder="Поиск..." value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5EBC]"
              />
            </div>
          </form>
          <button onClick={onContactOpen} className="mt-3 w-full h-9 bg-[#1D5EBC] text-white text-sm font-medium rounded-lg">
            Оставить заявку
          </button>
        </div>
      )}
    </header>
  );
}
