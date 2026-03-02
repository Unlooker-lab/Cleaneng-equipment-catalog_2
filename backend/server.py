from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class ContactForm(BaseModel):
    name: str
    email: str = ""
    phone: str
    message: str = ""


class ConfiguratorSubmission(BaseModel):
    config: dict
    contact: dict
    estimate: Optional[dict] = None


SEED_CATEGORIES = [
    {"id": "cat-1", "name": "Оборудование", "slug": "equipment", "parent_id": None, "icon": "Wrench", "count": 6},
    {"id": "cat-1-1", "name": "Аппараты высокого давления", "slug": "high-pressure", "parent_id": "cat-1", "icon": "Gauge", "count": 6},
    {"id": "cat-1-2", "name": "Пеногенераторы и пенокомплекты", "slug": "foam-generators", "parent_id": "cat-1", "icon": "Droplets", "count": 2},
    {"id": "cat-1-3", "name": "Насосы и фильтры", "slug": "pumps-filters", "parent_id": "cat-1", "icon": "Filter", "count": 3},
    {"id": "cat-1-4", "name": "Генераторы горячей воды", "slug": "water-heaters", "parent_id": "cat-1", "icon": "Flame", "count": 1},
    {"id": "cat-1-5", "name": "Пылесосы и химчистка", "slug": "vacuums", "parent_id": "cat-1", "icon": "Wind", "count": 1},
    {"id": "cat-2", "name": "Промышленные решения", "slug": "industrial", "parent_id": None, "icon": "Factory", "count": 1},
    {"id": "cat-2-1", "name": "Автомойки самообслуживания", "slug": "self-service", "parent_id": "cat-2", "icon": "Car", "count": 1},
    {"id": "cat-2-2", "name": "Тоннельные системы", "slug": "tunnel", "parent_id": "cat-2", "icon": "ArrowRight", "count": 0},
    {"id": "cat-2-3", "name": "Робот-мойки", "slug": "robot", "parent_id": "cat-2", "icon": "Bot", "count": 0},
    {"id": "cat-3", "name": "Аксессуары и комплектующие", "slug": "accessories", "parent_id": None, "icon": "Settings", "count": 3},
    {"id": "cat-4", "name": "Автохимия", "slug": "chemistry", "parent_id": None, "icon": "FlaskConical", "count": 2},
    {"id": "cat-4-1", "name": "Шампуни и пены", "slug": "shampoo", "parent_id": "cat-4", "icon": "Droplet", "count": 1},
    {"id": "cat-4-2", "name": "Воск и гидрофобизаторы", "slug": "wax", "parent_id": "cat-4", "icon": "Shield", "count": 1},
    {"id": "cat-4-3", "name": "Очистители", "slug": "cleaners", "parent_id": "cat-4", "icon": "Sparkles", "count": 0},
    {"id": "cat-5", "name": "Сопутствующие материалы", "slug": "materials", "parent_id": None, "icon": "Package", "count": 0},
]

SEED_PRODUCTS = [
    {
        "id": "prod-1", "name": "Аппарат высокого давления Struna2", "slug": "avd-struna2",
        "category_id": "cat-1-1", "category_name": "Аппараты высокого давления",
        "brand": "TOR", "price": 2000.0, "old_price": None,
        "image": "https://avdirvd.by/wp-content/uploads/2025/10/AvdStruna1-300x300.jpeg",
        "description": "Профессиональный аппарат высокого давления для автомоек. Надёжная конструкция, высокая производительность.",
        "specs": {"pressure": 180, "flow": 12, "power": "4 кВт", "voltage": "380В"},
        "is_new": False, "is_sale": False, "in_stock": True, "sku": "TOR-STRUNA2",
        "created_at": "2025-01-15T10:00:00Z"
    },
    {
        "id": "prod-2", "name": "Аппарат высокого давления TOR 12/180 BP 4", "slug": "tor-12-180-bp4",
        "category_id": "cat-1-1", "category_name": "Аппараты высокого давления",
        "brand": "TOR", "price": 2700.0, "old_price": None,
        "image": "https://avdirvd.by/wp-content/uploads/2025/12/TOR-12180-BP-4_3-300x225.jpeg",
        "description": "Аппарат высокого давления с насосом Annovi Reverberi. Идеален для профессиональных автомоек.",
        "specs": {"pressure": 180, "flow": 12, "power": "4 кВт", "voltage": "380В"},
        "is_new": True, "is_sale": False, "in_stock": True, "sku": "TOR-12180-BP4",
        "created_at": "2025-06-01T10:00:00Z"
    },
    {
        "id": "prod-3", "name": "Аппарат высокого давления TOR 15/200 BP 5.5", "slug": "tor-15-200-bp55",
        "category_id": "cat-1-1", "category_name": "Аппараты высокого давления",
        "brand": "TOR", "price": 4490.0, "old_price": None,
        "image": "https://avdirvd.by/wp-content/uploads/2025/12/TOR-15200-BP-55_2-300x200.png",
        "description": "Мощный аппарат высокого давления для интенсивной эксплуатации на коммерческих автомойках.",
        "specs": {"pressure": 200, "flow": 15, "power": "5.5 кВт", "voltage": "380В"},
        "is_new": False, "is_sale": False, "in_stock": True, "sku": "TOR-15200-BP55",
        "created_at": "2025-04-01T10:00:00Z"
    },
    {
        "id": "prod-4", "name": "Аппарат высокого давления TOR AR 15/280 BP 7.5", "slug": "tor-ar-15-280-bp75",
        "category_id": "cat-1-1", "category_name": "Аппараты высокого давления",
        "brand": "TOR", "price": 5800.0, "old_price": None,
        "image": "https://avdirvd.by/wp-content/uploads/2025/12/TOR-15280-BP-7.5-300x225.jpeg",
        "description": "Промышленный аппарат высокого давления с насосом Annovi Reverberi. Максимальная производительность.",
        "specs": {"pressure": 280, "flow": 15, "power": "7.5 кВт", "voltage": "380В"},
        "is_new": True, "is_sale": False, "in_stock": True, "sku": "TOR-AR-15280-BP75",
        "created_at": "2025-07-01T10:00:00Z"
    },
    {
        "id": "prod-5", "name": "Аппарат высокого давления TOR AR 15/280 BP 7.5+", "slug": "tor-ar-15-280-bp75-plus",
        "category_id": "cat-1-1", "category_name": "Аппараты высокого давления",
        "brand": "TOR", "price": 5900.0, "old_price": None,
        "image": "https://avdirvd.by/wp-content/uploads/2025/12/TOR-15280-BP-7.5-300x225.jpeg",
        "description": "Улучшенная версия промышленного аппарата с расширенным функционалом и защитой.",
        "specs": {"pressure": 280, "flow": 15, "power": "7.5 кВт", "voltage": "380В"},
        "is_new": True, "is_sale": False, "in_stock": True, "sku": "TOR-AR-15280-BP75+",
        "created_at": "2025-08-01T10:00:00Z"
    },
    {
        "id": "prod-6", "name": "Аппарат высокого давления AR 1520 Total Stop", "slug": "ar-1520-total-stop",
        "category_id": "cat-1-1", "category_name": "Аппараты высокого давления",
        "brand": "Annovi Reverberi", "price": 3450.0, "old_price": 3750.0,
        "image": "https://avdirvd.by/wp-content/uploads/2025/11/AVD.png",
        "description": "Аппарат высокого давления с функцией Total Stop от Annovi Reverberi.",
        "specs": {"pressure": 200, "flow": 15, "power": "5.5 кВт", "voltage": "380В"},
        "is_new": False, "is_sale": True, "in_stock": True, "sku": "AR-1520-TS",
        "created_at": "2025-03-01T10:00:00Z"
    },
    {
        "id": "prod-7", "name": "Пеногенератор RM Suttner ST-73", "slug": "rm-suttner-st73",
        "category_id": "cat-1-2", "category_name": "Пеногенераторы и пенокомплекты",
        "brand": "RM Suttner", "price": 890.0, "old_price": None,
        "image": "https://images.unsplash.com/photo-1706033915017-b1313a8e5c18?w=400&h=400&fit=crop",
        "description": "Профессиональный пеногенератор из нержавеющей стали для бесконтактной мойки.",
        "specs": {"capacity": "50 л", "pressure_max": 200, "material": "Нерж. сталь"},
        "is_new": True, "is_sale": False, "in_stock": True, "sku": "RMS-ST73",
        "created_at": "2025-09-01T10:00:00Z"
    },
    {
        "id": "prod-8", "name": "Пенокомплект CTW Foam Pro 25", "slug": "ctw-foam-pro-25",
        "category_id": "cat-1-2", "category_name": "Пеногенераторы и пенокомплекты",
        "brand": "CTW Cleaning", "price": 650.0, "old_price": None,
        "image": "https://images.unsplash.com/photo-1720670996646-2f5d69a10ee7?w=400&h=400&fit=crop",
        "description": "Компактный пенокомплект для подключения к аппаратам высокого давления. Бак 25 л.",
        "specs": {"capacity": "25 л", "pressure_max": 180, "material": "Полиэтилен"},
        "is_new": False, "is_sale": False, "in_stock": True, "sku": "CTW-FP25",
        "created_at": "2025-05-15T10:00:00Z"
    },
    {
        "id": "prod-9", "name": "Насос HAWK NMT 1520R", "slug": "hawk-nmt-1520r",
        "category_id": "cat-1-3", "category_name": "Насосы и фильтры",
        "brand": "HAWK", "price": 1650.0, "old_price": None,
        "image": "https://images.unsplash.com/photo-1701448149957-b96dbd1926ff?w=400&h=400&fit=crop",
        "description": "Плунжерный насос высокого давления HAWK серии NMT. Керамические плунжеры, латунная головка.",
        "specs": {"pressure": 200, "flow": 15, "rpm": "1450 об/мин"},
        "is_new": False, "is_sale": False, "in_stock": True, "sku": "HAWK-NMT1520R",
        "created_at": "2025-02-01T10:00:00Z"
    },
    {
        "id": "prod-10", "name": "Насос Annovi Reverberi RK 15.20 H N", "slug": "ar-rk-1520hn",
        "category_id": "cat-1-3", "category_name": "Насосы и фильтры",
        "brand": "Annovi Reverberi", "price": 1890.0, "old_price": None,
        "image": "https://images.unsplash.com/photo-1603577892375-f05581d44e29?w=400&h=400&fit=crop",
        "description": "Профессиональный плунжерный насос Annovi Reverberi серии RK для стационарных моечных систем.",
        "specs": {"pressure": 200, "flow": 15, "rpm": "1450 об/мин"},
        "is_new": True, "is_sale": False, "in_stock": True, "sku": "AR-RK1520HN",
        "created_at": "2025-10-01T10:00:00Z"
    },
    {
        "id": "prod-11", "name": "Фильтр водяной 3/4\" 100 mesh", "slug": "water-filter-100mesh",
        "category_id": "cat-1-3", "category_name": "Насосы и фильтры",
        "brand": "TOR", "price": 35.0, "old_price": None,
        "image": "https://images.unsplash.com/photo-1740362381367-09cb98b4e1c6?w=400&h=400&fit=crop",
        "description": "Водяной фильтр для защиты насосов высокого давления от загрязнений.",
        "specs": {"connection": "3/4\"", "mesh": 100, "material": "Латунь"},
        "is_new": False, "is_sale": False, "in_stock": True, "sku": "TOR-WF100",
        "created_at": "2025-01-20T10:00:00Z"
    },
    {
        "id": "prod-12", "name": "Бойлер промышленный CTW HW-200", "slug": "ctw-hw200",
        "category_id": "cat-1-4", "category_name": "Генераторы горячей воды",
        "brand": "CTW Cleaning", "price": 8500.0, "old_price": 9200.0,
        "image": "https://images.unsplash.com/photo-1720670996646-2f5d69a10ee7?w=400&h=400&fit=crop",
        "description": "Промышленный генератор горячей воды для автомоек. Дизельный нагрев, высокий КПД.",
        "specs": {"power": "200 кВт", "temperature_max": "140C", "fuel": "Дизель"},
        "is_new": False, "is_sale": True, "in_stock": True, "sku": "CTW-HW200",
        "created_at": "2025-05-01T10:00:00Z"
    },
    {
        "id": "prod-13", "name": "Пылесос промышленный Groninger WD-35", "slug": "groninger-wd35",
        "category_id": "cat-1-5", "category_name": "Пылесосы и химчистка",
        "brand": "Groninger", "price": 1200.0, "old_price": None,
        "image": "https://images.unsplash.com/photo-1706033915017-b1313a8e5c18?w=400&h=400&fit=crop",
        "description": "Промышленный пылесос для влажной и сухой уборки. Бак 35 литров, мощный двигатель.",
        "specs": {"power": "1400 Вт", "capacity": "35 л", "type": "Влажная/сухая"},
        "is_new": True, "is_sale": False, "in_stock": True, "sku": "GRN-WD35",
        "created_at": "2025-11-01T10:00:00Z"
    },
    {
        "id": "prod-14", "name": "Шланг высокого давления DN8 20м", "slug": "hose-dn8-20m",
        "category_id": "cat-3", "category_name": "Аксессуары и комплектующие",
        "brand": "RM Suttner", "price": 180.0, "old_price": None,
        "image": "https://images.unsplash.com/photo-1615746361842-33eaad7d1263?w=400&h=400&fit=crop",
        "description": "Шланг высокого давления DN8 длиной 20 метров. Рабочее давление до 400 бар.",
        "specs": {"length": "20 м", "diameter": "DN8", "pressure_max": 400},
        "is_new": False, "is_sale": False, "in_stock": True, "sku": "RMS-DN8-20",
        "created_at": "2025-01-10T10:00:00Z"
    },
    {
        "id": "prod-15", "name": "Пистолет моечный RM Suttner ST-2600", "slug": "rm-suttner-st2600",
        "category_id": "cat-3", "category_name": "Аксессуары и комплектующие",
        "brand": "RM Suttner", "price": 320.0, "old_price": None,
        "image": "https://images.unsplash.com/photo-1615746361842-33eaad7d1263?w=400&h=400&fit=crop",
        "description": "Профессиональный моечный пистолет с функцией регулировки давления.",
        "specs": {"pressure_max": 310, "flow_max": 30, "connection": "3/8\""},
        "is_new": False, "is_sale": False, "in_stock": True, "sku": "RMS-ST2600",
        "created_at": "2025-02-15T10:00:00Z"
    },
    {
        "id": "prod-16", "name": "Копье моечное 900мм нерж.", "slug": "lance-900mm",
        "category_id": "cat-3", "category_name": "Аксессуары и комплектующие",
        "brand": "RM Suttner", "price": 95.0, "old_price": None,
        "image": "https://images.unsplash.com/photo-1615746361842-33eaad7d1263?w=400&h=400&fit=crop",
        "description": "Моечное копье из нержавеющей стали длиной 900мм с форсункой.",
        "specs": {"length": "900 мм", "material": "Нерж. сталь", "connection": "1/4\""},
        "is_new": False, "is_sale": False, "in_stock": True, "sku": "RMS-L900",
        "created_at": "2025-03-10T10:00:00Z"
    },
    {
        "id": "prod-17", "name": "Шампунь для бесконтактной мойки Active Foam", "slug": "active-foam",
        "category_id": "cat-4-1", "category_name": "Шампуни и пены",
        "brand": "CTW Cleaning", "price": 45.0, "old_price": None,
        "image": "https://images.unsplash.com/photo-1740362381367-09cb98b4e1c6?w=400&h=400&fit=crop",
        "description": "Концентрированное средство для бесконтактной мойки. Разведение 1:50.",
        "specs": {"volume": "20 л", "concentration": "1:50", "ph": "12"},
        "is_new": True, "is_sale": False, "in_stock": True, "sku": "CTW-AF20",
        "created_at": "2025-12-01T10:00:00Z"
    },
    {
        "id": "prod-18", "name": "Воск горячий Hydro Wax", "slug": "hydro-wax",
        "category_id": "cat-4-2", "category_name": "Воск и гидрофобизаторы",
        "brand": "CTW Cleaning", "price": 65.0, "old_price": None,
        "image": "https://images.unsplash.com/photo-1740362381367-09cb98b4e1c6?w=400&h=400&fit=crop",
        "description": "Горячий воск для финишной обработки кузова автомобиля на автомойках.",
        "specs": {"volume": "20 л", "concentration": "1:100", "type": "Горячий"},
        "is_new": False, "is_sale": False, "in_stock": True, "sku": "CTW-HW20",
        "created_at": "2025-04-15T10:00:00Z"
    },
    {
        "id": "prod-19", "name": "Комплекс мойки самообслуживания Christ SB Wash", "slug": "christ-sb-wash",
        "category_id": "cat-2-1", "category_name": "Автомойки самообслуживания",
        "brand": "Christ AG", "price": 45000.0, "old_price": None,
        "image": "https://images.unsplash.com/photo-1720670996646-2f5d69a10ee7?w=400&h=400&fit=crop",
        "description": "Полный комплекс мойки самообслуживания на 4 поста. Оборудование, химия и система оплаты.",
        "specs": {"posts": 4, "programs": 6, "payment": "Монеты/жетоны"},
        "is_new": True, "is_sale": False, "in_stock": False, "sku": "CHR-SB4",
        "created_at": "2025-12-15T10:00:00Z"
    },
]


async def seed_data():
    count = await db.products.count_documents({})
    if count > 0:
        return
    await db.categories.insert_many(SEED_CATEGORIES)
    await db.products.insert_many(SEED_PRODUCTS)
    logger.info("Database seeded with %d products and %d categories", len(SEED_PRODUCTS), len(SEED_CATEGORIES))


@app.on_event("startup")
async def startup():
    await seed_data()


@api_router.get("/")
async def root():
    return {"message": "AVDIRVD API"}


@api_router.get("/products")
async def get_products(
    category: Optional[str] = None,
    brand: Optional[str] = None,
    price_min: Optional[float] = None,
    price_max: Optional[float] = None,
    pressure: Optional[str] = None,
    flow: Optional[str] = None,
    sort: str = "default",
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 12,
):
    query = {}

    if category:
        query["$or"] = [{"category_id": category}, {"category_name": category}]

    if brand:
        brands_list = brand.split(",")
        query["brand"] = {"$in": brands_list}

    price_q = {}
    if price_min is not None:
        price_q["$gte"] = price_min
    if price_max is not None:
        price_q["$lte"] = price_max
    if price_q:
        query["price"] = price_q

    if pressure:
        vals = [int(v) for v in pressure.split(",")]
        query["specs.pressure"] = {"$in": vals}

    if flow:
        vals = [int(v) for v in flow.split(",")]
        query["specs.flow"] = {"$in": vals}

    if search:
        query["name"] = {"$regex": search, "$options": "i"}

    sort_field = [("created_at", -1)]
    if sort == "price_asc":
        sort_field = [("price", 1)]
    elif sort == "price_desc":
        sort_field = [("price", -1)]
    elif sort == "name_asc":
        sort_field = [("name", 1)]
    elif sort == "name_desc":
        sort_field = [("name", -1)]
    elif sort == "new":
        sort_field = [("created_at", -1)]

    skip = (page - 1) * limit
    total = await db.products.count_documents(query)
    products = await db.products.find(query, {"_id": 0}).sort(sort_field).skip(skip).limit(limit).to_list(limit)

    return {
        "products": products,
        "total": total,
        "page": page,
        "pages": max(1, (total + limit - 1) // limit),
    }


@api_router.get("/products/new")
async def get_new_products(limit: int = 8):
    products = await db.products.find({"is_new": True}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return {"products": products}


@api_router.get("/categories")
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    return {"categories": categories}


@api_router.get("/brands")
async def get_brands():
    brands = await db.products.distinct("brand")
    return {"brands": sorted(brands)}


@api_router.get("/filters/ranges")
async def get_filter_ranges():
    pipeline = [
        {"$group": {
            "_id": None,
            "min_price": {"$min": "$price"},
            "max_price": {"$max": "$price"},
            "pressures": {"$addToSet": "$specs.pressure"},
            "flows": {"$addToSet": "$specs.flow"},
        }}
    ]
    result = await db.products.aggregate(pipeline).to_list(1)
    if result:
        r = result[0]
        pressures = sorted([p for p in r.get("pressures", []) if p is not None])
        flows = sorted([f for f in r.get("flows", []) if f is not None])
        return {
            "price_min": r["min_price"],
            "price_max": r["max_price"],
            "pressures": pressures,
            "flows": flows,
        }
    return {"price_min": 0, "price_max": 0, "pressures": [], "flows": []}


@api_router.post("/configurator")
async def submit_configurator(data: ConfiguratorSubmission):
    doc = {
        "id": str(uuid.uuid4()),
        "config": data.config,
        "contact": data.contact,
        "estimate": data.estimate,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.configurator_submissions.insert_one(doc)
    return {"success": True, "message": "Заявка на расчёт принята", "estimate": data.estimate}


@api_router.post("/contact")
async def submit_contact(form: ContactForm):
    doc = {
        "id": str(uuid.uuid4()),
        "name": form.name,
        "email": form.email,
        "phone": form.phone,
        "message": form.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.contact_submissions.insert_one(doc)
    return {"success": True, "message": "Заявка успешно отправлена"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
