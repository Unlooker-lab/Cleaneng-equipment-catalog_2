import { useState } from "react";
import { X, Send, CheckCircle } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ContactForm({ onClose }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setLoading(true);
    try {
      await axios.post(`${API}/contact`, form);
      setSent(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="contact-modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="contact-modal">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-900">Оставить заявку</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 transition-colors" data-testid="contact-close-btn">
            <X size={20} />
          </button>
        </div>

        {sent ? (
          <div className="text-center py-6" data-testid="contact-success">
            <CheckCircle size={48} className="mx-auto text-emerald-500 mb-3" />
            <h4 className="text-base font-semibold text-slate-900 mb-1">Заявка отправлена</h4>
            <p className="text-sm text-slate-500">Мы свяжемся с вами в ближайшее время</p>
            <button onClick={onClose} className="mt-4 h-9 px-6 bg-[#1D5EBC] text-white text-sm font-medium rounded-lg">Закрыть</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Имя *</label>
              <input data-testid="contact-name" type="text" value={form.name} onChange={set("name")} required
                className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5EBC] focus:border-transparent" placeholder="Ваше имя" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Телефон *</label>
              <input data-testid="contact-phone" type="tel" value={form.phone} onChange={set("phone")} required
                className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5EBC] focus:border-transparent" placeholder="+375 (__) ___-__-__" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input data-testid="contact-email" type="email" value={form.email} onChange={set("email")}
                className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5EBC] focus:border-transparent" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Сообщение</label>
              <textarea data-testid="contact-message" value={form.message} onChange={set("message")} rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5EBC] focus:border-transparent resize-none" placeholder="Опишите ваш запрос..." />
            </div>
            <button data-testid="contact-submit-btn" type="submit" disabled={loading}
              className="w-full h-10 bg-[#1D5EBC] hover:bg-[#164B96] text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
              <Send size={15} />
              {loading ? "Отправка..." : "Отправить заявку"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
