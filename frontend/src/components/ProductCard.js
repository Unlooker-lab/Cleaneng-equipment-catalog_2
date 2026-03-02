import { useState } from "react";
import { ShoppingCart, Gauge, Droplets, Zap, Tag } from "lucide-react";

function ImageFallback({ brand, category }) {
  return (
    <div className="img-placeholder w-full h-full flex flex-col items-center justify-center text-[#1D5EBC]">
      <span className="text-3xl font-bold opacity-30">{brand?.[0] || "A"}</span>
      <span className="text-[10px] font-medium opacity-40 mt-1 text-center px-2">{category}</span>
    </div>
  );
}

export default function ProductCard({ product, viewMode }) {
  const [imgError, setImgError] = useState(false);
  const p = product;
  const hasImage = p.image && !imgError;

  if (viewMode === "list") {
    return (
      <div className="group flex border border-slate-200 rounded-lg overflow-hidden hover:shadow-md hover:border-[#1D5EBC]/30 transition-all duration-300 product-card-enter bg-white" data-testid={`product-card-${p.id}`}>
        <div className="w-48 h-40 shrink-0 bg-slate-50 relative overflow-hidden">
          {hasImage ? (
            <img src={p.image} alt={p.name} onError={() => setImgError(true)} className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <ImageFallback brand={p.brand} category={p.category_name} />
          )}
          {p.is_new && <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-semibold rounded">NEW</span>}
          {p.is_sale && <span className="absolute top-2 right-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-semibold rounded">SALE</span>}
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            <p className="text-[11px] font-medium text-[#1D5EBC] mb-1">{p.category_name}</p>
            <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 mb-2">{p.name}</h3>
            <p className="text-xs text-slate-500 line-clamp-2 mb-2">{p.description}</p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {p.specs?.pressure && <span className="flex items-center gap-1"><Gauge size={12} />{p.specs.pressure} бар</span>}
              {p.specs?.flow && <span className="flex items-center gap-1"><Droplets size={12} />{p.specs.flow} л/мин</span>}
              {p.specs?.power && <span className="flex items-center gap-1"><Zap size={12} />{p.specs.power}</span>}
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-slate-900">{p.price.toLocaleString("ru-RU")} Br</span>
              {p.old_price && <span className="text-sm text-slate-400 line-through">{p.old_price.toLocaleString("ru-RU")} Br</span>}
            </div>
            <button data-testid={`add-to-cart-${p.id}`} className="flex items-center gap-1.5 h-8 px-4 bg-[#1D5EBC] hover:bg-[#164B96] text-white text-xs font-medium rounded-md transition-colors">
              <ShoppingCart size={13} />Запрос
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCompact = viewMode === "compact";

  return (
    <div className="group flex flex-col border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-[#1D5EBC]/30 transition-all duration-300 product-card-enter bg-white" data-testid={`product-card-${p.id}`}>
      <div className={`relative bg-slate-50 overflow-hidden ${isCompact ? "h-36" : "h-52"}`}>
        {hasImage ? (
          <img src={p.image} alt={p.name} onError={() => setImgError(true)} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <ImageFallback brand={p.brand} category={p.category_name} />
        )}
        {p.is_new && <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-semibold rounded">NEW</span>}
        {p.is_sale && <span className="absolute top-2 right-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-semibold rounded">SALE</span>}
        {!p.in_stock && <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-700 text-white text-[10px] font-semibold rounded">Под заказ</span>}
      </div>

      <div className="flex-1 p-3 flex flex-col">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Tag size={10} className="text-[#1D5EBC]" />
          <span className="text-[10px] font-medium text-[#1D5EBC]">{p.category_name}</span>
        </div>
        <h3 className={`font-semibold text-slate-900 leading-snug mb-2 line-clamp-2 ${isCompact ? "text-xs" : "text-sm"}`}>{p.name}</h3>

        {!isCompact && (
          <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-2">
            {p.specs?.pressure && <span className="flex items-center gap-1"><Gauge size={11} />{p.specs.pressure} бар</span>}
            {p.specs?.flow && <span className="flex items-center gap-1"><Droplets size={11} />{p.specs.flow} л/мин</span>}
            {p.specs?.power && <span className="flex items-center gap-1"><Zap size={11} />{p.specs.power}</span>}
          </div>
        )}

        <div className="mt-auto pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <span className={`font-bold text-slate-900 ${isCompact ? "text-sm" : "text-base"}`}>{p.price.toLocaleString("ru-RU")} Br</span>
              {p.old_price && <span className="block text-xs text-slate-400 line-through">{p.old_price.toLocaleString("ru-RU")} Br</span>}
            </div>
            <button data-testid={`add-to-cart-${p.id}`} className={`flex items-center justify-center bg-[#1D5EBC] hover:bg-[#164B96] text-white rounded-md transition-colors ${isCompact ? "w-7 h-7" : "w-8 h-8"}`}>
              <ShoppingCart size={isCompact ? 13 : 14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
