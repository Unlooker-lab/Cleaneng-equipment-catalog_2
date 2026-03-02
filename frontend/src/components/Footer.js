import { Phone, Mail, MapPin } from "lucide-react";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_washtech-solutions/artifacts/y2cyxval_Logo_new_AVDIRVD_2.jpeg";

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white mt-20" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <img src={LOGO_URL} alt="AVDIRVD" className="h-10 w-auto mb-4 brightness-0 invert" />
            <p className="text-slate-400 text-sm leading-relaxed">
              Профессиональное оборудование для автомоек, моек самообслуживания и промышленной очистки.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">Каталог</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="/" className="hover:text-white transition-colors">Аппараты высокого давления</a></li>
              <li><a href="/" className="hover:text-white transition-colors">Пеногенераторы</a></li>
              <li><a href="/" className="hover:text-white transition-colors">Насосы и фильтры</a></li>
              <li><a href="/" className="hover:text-white transition-colors">Аксессуары</a></li>
              <li><a href="/" className="hover:text-white transition-colors">Автохимия</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">Информация</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="/" className="hover:text-white transition-colors">О компании</a></li>
              <li><a href="/" className="hover:text-white transition-colors">Доставка и оплата</a></li>
              <li><a href="/" className="hover:text-white transition-colors">Гарантия</a></li>
              <li><a href="/" className="hover:text-white transition-colors">Политика конфиденциальности</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">Контакты</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <Phone size={15} className="mt-0.5 shrink-0 text-[#1D5EBC]" />
                <div>
                  <a href="tel:+375291234567" className="hover:text-white transition-colors">+375 (29) 123-45-67</a>
                  <p className="text-xs text-slate-500 mt-0.5">Пн-Пт: 9:00 - 18:00</p>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="shrink-0 text-[#1D5EBC]" />
                <a href="mailto:info@avdirvd.by" className="hover:text-white transition-colors">info@avdirvd.by</a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#1D5EBC]" />
                <span>Минск, ул. Промышленная 1</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <span>2025 AVDIRVD. Все права защищены.</span>
          <span className="mt-2 md:mt-0">Оборудование для автомоек - avdirvd.by</span>
        </div>
      </div>
    </footer>
  );
}
