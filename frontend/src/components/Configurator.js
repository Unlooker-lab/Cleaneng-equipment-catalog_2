import { useState, useMemo } from "react";
import {
  Car, Landmark, Truck, CircleDot, Container, Factory,
  Wrench, Monitor, ArrowRightLeft, Bot,
  Droplets, Gauge, Layers,
  Waves, Filter, Flame, Cloud, Droplet, Wind,
  FileText, Palette, Shield,
  ChevronLeft, ChevronRight, Calculator, Send, CheckCircle, Loader2
} from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const WASH_TYPES = [
  { id: "car", label: "Легковая", icon: Car, base: 3500 },
  { id: "self-service", label: "Мойка самообслуживания", icon: Landmark, base: 8000 },
  { id: "truck", label: "Грузовая", icon: Truck, base: 6500 },
  { id: "cistern", label: "Мойка цистерн", icon: CircleDot, base: 12000 },
  { id: "tank", label: "Мойка танк-контейнеров", icon: Container, base: 15000 },
  { id: "industrial", label: "Промышленные моечные системы", icon: Factory, base: 20000 },
];

const POST_COUNTS = [
  { id: 1, label: "1 пост", mult: 1.0 },
  { id: 2, label: "2 поста", mult: 1.85 },
  { id: 3, label: "3 поста", mult: 2.6 },
  { id: 4, label: "4 поста", mult: 3.3 },
  { id: "5+", label: "5+ постов", mult: 4.0 },
];

const EQUIP_TYPES = [
  { id: "manual", label: "Ручное (АВД)", icon: Wrench, factor: 1.0 },
  { id: "portal", label: "Автоматическое (портал)", icon: Monitor, factor: 2.8 },
  { id: "tunnel", label: "Туннельное", icon: ArrowRightLeft, factor: 5.0 },
  { id: "robot", label: "Роботизированное", icon: Bot, factor: 3.5 },
];

const CHEM_TYPES = [
  { id: "foam", label: "Пенокомплект", icon: Droplets, perPost: 650 },
  { id: "autodose", label: "Автодозация (дозатрон)", icon: Gauge, perPost: 1500 },
  { id: "combined", label: "Комбинированное", icon: Layers, perPost: 1900 },
];

const EXTRA_OPTIONS = [
  { id: "softener", label: "Смягчение воды", icon: Waves, price: 1200 },
  { id: "osmosis", label: "Осмос", icon: Filter, price: 3800 },
  { id: "boiler", label: "Бойлер", icon: Flame, price: 4500 },
  { id: "steam", label: "Парогенератор", icon: Cloud, price: 5200 },
  { id: "water-treat", label: "Водоочистка", icon: Droplet, price: 2200 },
  { id: "compressor", label: "Компрессор", icon: Wind, price: 2800 },
];

const SERVICES = [
  { id: "tz", label: "Разработка ТЗ", icon: FileText, price: 800 },
  { id: "design", label: "Дизайн-проект", icon: Palette, price: 2000 },
  { id: "install", label: "Монтаж и сервис", icon: Wrench, price: 0, pct: 15 },
  { id: "warranty", label: "Гарантия и обучение", icon: Shield, price: 1200 },
];

const STEPS = [
  { title: "Тип мойки", desc: "Выберите тип моечного объекта" },
  { title: "Количество постов", desc: "Укажите необходимое количество постов" },
  { title: "Тип оборудования", desc: "Выберите тип моечного оборудования" },
  { title: "Подача химии", desc: "Выберите способ нанесения и подачи химии" },
  { title: "Опции и услуги", desc: "Дополнительные опции и требуемые услуги" },
  { title: "Расчёт стоимости", desc: "Куда отправить расчёт" },
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto" data-testid="step-indicator">
      {STEPS.map((s, i) => (
        <div key={i} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
            i < current ? "bg-[#1D5EBC] text-white" :
            i === current ? "bg-[#1D5EBC] text-white ring-4 ring-[#1D5EBC]/20" :
            "bg-slate-200 text-slate-500"
          }`}>
            {i < current ? (
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-8 sm:w-12 md:w-16 h-0.5 mx-1 transition-colors duration-300 ${i < current ? "bg-[#1D5EBC]" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function SelectCard({ item, selected, onClick, testId }) {
  const Icon = item.icon;
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer min-h-[100px] ${
        selected
          ? "border-[#1D5EBC] bg-[#EBF1FA] shadow-md"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <Icon size={28} className={`mb-2 transition-colors ${selected ? "text-[#1D5EBC]" : "text-slate-400"}`} />
      <span className={`text-sm font-medium text-center leading-tight ${selected ? "text-[#1D5EBC]" : "text-slate-700"}`}>{item.label}</span>
    </button>
  );
}

function CheckOption({ item, checked, onChange, testId, priceLabel }) {
  const Icon = item.icon;
  return (
    <label
      data-testid={testId}
      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
        checked ? "border-[#1D5EBC] bg-[#EBF1FA]" : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
        checked ? "bg-[#1D5EBC] border-[#1D5EBC]" : "border-slate-300"
      }`}>
        {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
      <Icon size={18} className={checked ? "text-[#1D5EBC]" : "text-slate-400"} />
      <span className="flex-1 text-sm font-medium text-slate-700">{item.label}</span>
      {priceLabel && <span className="text-xs text-slate-500">{priceLabel}</span>}
    </label>
  );
}

export default function Configurator() {
  const [step, setStep] = useState(0);
  const [cfg, setCfg] = useState({
    washType: null, postCount: null, equipType: null, chemType: null,
    extras: [], services: [],
  });
  const [contact, setContact] = useState({ name: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key, val) => setCfg((p) => ({ ...p, [key]: val }));
  const toggleArr = (key, val) => setCfg((p) => ({
    ...p, [key]: p[key].includes(val) ? p[key].filter((v) => v !== val) : [...p[key], val],
  }));

  const estimate = useMemo(() => {
    const wt = WASH_TYPES.find((w) => w.id === cfg.washType);
    const pc = POST_COUNTS.find((p) => p.id === cfg.postCount);
    const eq = EQUIP_TYPES.find((e) => e.id === cfg.equipType);
    const ch = CHEM_TYPES.find((c) => c.id === cfg.chemType);
    if (!wt || !pc || !eq) return null;

    const posts = typeof pc.id === "number" ? pc.id : 5;
    const equipCost = Math.round(wt.base * pc.mult * eq.factor);
    const chemCost = ch ? ch.perPost * posts : 0;
    const extraCost = EXTRA_OPTIONS.filter((o) => cfg.extras.includes(o.id)).reduce((s, o) => s + o.price, 0);

    let serviceCost = 0;
    cfg.services.forEach((sid) => {
      const svc = SERVICES.find((s) => s.id === sid);
      if (svc) {
        serviceCost += svc.pct ? Math.round(equipCost * svc.pct / 100) : svc.price;
      }
    });

    return {
      equipCost, chemCost, extraCost, serviceCost,
      total: equipCost + chemCost + extraCost + serviceCost,
      posts,
    };
  }, [cfg]);

  const canNext = () => {
    if (step === 0) return !!cfg.washType;
    if (step === 1) return !!cfg.postCount;
    if (step === 2) return !!cfg.equipType;
    if (step === 3) return !!cfg.chemType;
    return true;
  };

  const handleSubmit = async () => {
    if (!contact.name || !contact.phone) return;
    setSubmitting(true);
    try {
      await axios.post(`${API}/configurator`, { config: cfg, contact, estimate });
      setSubmitted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setCfg({ washType: null, postCount: null, equipType: null, chemType: null, extras: [], services: [] });
    setContact({ name: "", phone: "", email: "" });
    setSubmitted(false);
  };

  const fmt = (n) => n?.toLocaleString("ru-RU") || "0";

  return (
    <section className="bg-slate-50 border-y border-slate-200 py-14 mt-12" data-testid="configurator-section">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1D5EBC]/10 rounded-full text-[#1D5EBC] text-xs font-semibold mb-3">
            <Calculator size={14} />
            Конфигуратор
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Подберите комплект оборудования</h2>
          <p className="text-slate-500 mt-2 text-sm">Ответьте на несколько вопросов и получите расчёт стоимости</p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center" data-testid="configurator-success">
            <CheckCircle size={56} className="mx-auto text-emerald-500 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Заявка на расчёт отправлена</h3>
            <p className="text-slate-500 mb-1">Ориентировочная стоимость: <span className="font-bold text-slate-900">{fmt(estimate?.total)} Br</span></p>
            <p className="text-sm text-slate-400 mb-6">Наш специалист свяжется с вами для уточнения деталей и подготовки коммерческого предложения</p>
            <button onClick={handleReset} className="h-10 px-6 bg-[#1D5EBC] text-white text-sm font-medium rounded-lg hover:bg-[#164B96] transition-colors" data-testid="configurator-reset">
              Новый расчёт
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
            <StepIndicator current={step} />

            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">{STEPS[step].title}</h3>
              <p className="text-sm text-slate-500 mt-1">{STEPS[step].desc}</p>
            </div>

            <div className="min-h-[200px]">
              {step === 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3" data-testid="step-wash-type">
                  {WASH_TYPES.map((w) => (
                    <SelectCard key={w.id} item={w} selected={cfg.washType === w.id} onClick={() => set("washType", w.id)} testId={`wash-${w.id}`} />
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="flex flex-wrap justify-center gap-3" data-testid="step-post-count">
                  {POST_COUNTS.map((p) => (
                    <button
                      key={p.id}
                      data-testid={`post-${p.id}`}
                      onClick={() => set("postCount", p.id)}
                      className={`px-6 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                        cfg.postCount === p.id
                          ? "border-[#1D5EBC] bg-[#EBF1FA] text-[#1D5EBC] shadow-md"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="step-equip-type">
                  {EQUIP_TYPES.map((e) => (
                    <SelectCard key={e.id} item={e} selected={cfg.equipType === e.id} onClick={() => set("equipType", e.id)} testId={`equip-${e.id}`} />
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3" data-testid="step-chem-type">
                  {CHEM_TYPES.map((c) => (
                    <SelectCard key={c.id} item={c} selected={cfg.chemType === c.id} onClick={() => set("chemType", c.id)} testId={`chem-${c.id}`} />
                  ))}
                </div>
              )}

              {step === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="step-options">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Дополнительные опции</h4>
                    <div className="space-y-2">
                      {EXTRA_OPTIONS.map((o) => (
                        <CheckOption key={o.id} item={o} checked={cfg.extras.includes(o.id)} onChange={() => toggleArr("extras", o.id)} testId={`extra-${o.id}`} priceLabel={`${fmt(o.price)} Br`} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Требуемые услуги</h4>
                    <div className="space-y-2">
                      {SERVICES.map((s) => (
                        <CheckOption key={s.id} item={s} checked={cfg.services.includes(s.id)} onChange={() => toggleArr("services", s.id)} testId={`svc-${s.id}`} priceLabel={s.pct ? `${s.pct}%` : `${fmt(s.price)} Br`} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="step-summary">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Ваш комплект</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-600">Тип мойки</span>
                        <span className="font-medium text-slate-900">{WASH_TYPES.find((w) => w.id === cfg.washType)?.label}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-600">Постов</span>
                        <span className="font-medium text-slate-900">{POST_COUNTS.find((p) => p.id === cfg.postCount)?.label}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-600">Оборудование</span>
                        <span className="font-medium text-slate-900">{EQUIP_TYPES.find((e) => e.id === cfg.equipType)?.label}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-600">Подача химии</span>
                        <span className="font-medium text-slate-900">{CHEM_TYPES.find((c) => c.id === cfg.chemType)?.label}</span>
                      </div>
                      {cfg.extras.length > 0 && (
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-600">Доп. опции</span>
                          <span className="font-medium text-slate-900 text-right">{cfg.extras.map((id) => EXTRA_OPTIONS.find((o) => o.id === id)?.label).join(", ")}</span>
                        </div>
                      )}
                      {cfg.services.length > 0 && (
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-600">Услуги</span>
                          <span className="font-medium text-slate-900 text-right">{cfg.services.map((id) => SERVICES.find((s) => s.id === id)?.label).join(", ")}</span>
                        </div>
                      )}
                    </div>

                    {estimate && (
                      <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between"><span className="text-slate-500">Оборудование</span><span className="text-slate-700">{fmt(estimate.equipCost)} Br</span></div>
                          {estimate.chemCost > 0 && <div className="flex justify-between"><span className="text-slate-500">Подача химии</span><span className="text-slate-700">{fmt(estimate.chemCost)} Br</span></div>}
                          {estimate.extraCost > 0 && <div className="flex justify-between"><span className="text-slate-500">Доп. опции</span><span className="text-slate-700">{fmt(estimate.extraCost)} Br</span></div>}
                          {estimate.serviceCost > 0 && <div className="flex justify-between"><span className="text-slate-500">Услуги</span><span className="text-slate-700">{fmt(estimate.serviceCost)} Br</span></div>}
                        </div>
                        <div className="flex justify-between mt-3 pt-3 border-t border-slate-200">
                          <span className="font-bold text-slate-900">Итого (ориентировочно)</span>
                          <span className="text-xl font-bold text-[#1D5EBC]">{fmt(estimate.total)} Br</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Куда отправить расчёт</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Ваше имя *</label>
                        <input data-testid="cfg-name" type="text" value={contact.name} onChange={(e) => setContact((p) => ({ ...p, name: e.target.value }))} placeholder="Имя" className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5EBC] focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Телефон *</label>
                        <input data-testid="cfg-phone" type="tel" value={contact.phone} onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))} placeholder="+375 (__) ___-__-__" className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5EBC] focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                        <input data-testid="cfg-email" type="email" value={contact.email} onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))} placeholder="email@example.com" className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5EBC] focus:border-transparent" />
                      </div>
                      <button
                        data-testid="cfg-submit"
                        onClick={handleSubmit}
                        disabled={submitting || !contact.name || !contact.phone}
                        className="w-full h-11 bg-[#1D5EBC] hover:bg-[#164B96] text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                      >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        {submitting ? "Отправка..." : "Рассчитать стоимость"}
                      </button>
                      <p className="text-[11px] text-slate-400 text-center">Точная стоимость будет рассчитана специалистом после уточнения деталей</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {estimate && step < 5 && step >= 2 && (
              <div className="mt-6 p-3 bg-[#EBF1FA] rounded-lg flex items-center justify-between" data-testid="live-estimate">
                <span className="text-sm text-slate-600">Ориентировочная стоимость:</span>
                <span className="text-lg font-bold text-[#1D5EBC]">{fmt(estimate.total)} Br</span>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
              <button
                data-testid="cfg-prev"
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
                className="flex items-center gap-1.5 h-9 px-4 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />Назад
              </button>

              <div className="flex items-center gap-1.5">
                {STEPS.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? "bg-[#1D5EBC]" : i < step ? "bg-[#1D5EBC]/40" : "bg-slate-200"}`} />
                ))}
              </div>

              {step < 5 && (
                <button
                  data-testid="cfg-next"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canNext()}
                  className="flex items-center gap-1.5 h-9 px-5 text-sm font-medium bg-[#1D5EBC] text-white rounded-lg hover:bg-[#164B96] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Далее<ChevronRight size={16} />
                </button>
              )}
              {step === 5 && <div className="w-20" />}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
