"""
Real apartment data scraper for OLX.uz (Tashkent, sale listings).

Collects live listings via the public OLX offers API and writes them into
`tashkent_real_estate_data.csv` using the SAME schema as data_generator.py,
so train.py can consume real data instead of synthetic data.

Usage:
    python -m app.ml.scrape_olx --pages 60 --out tashkent_real_estate_data.csv
"""
import argparse
import csv
import os
import time
import requests

API = "https://www.olx.uz/api/v1/offers/"
CATEGORY_APARTMENTS = 13        # OLX.uz: apartments FOR SALE (Prodazha kvartir)
REGION_TASHKENT = 5             # Tashkent city region
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept": "application/json",
}

# OLX district name (Russian) -> our district_id (matches data_generator DISTRICTS)
DISTRICT_MAP = [
    ("юнусабад", 0), ("yunusobod", 0),
    ("мирзо", 1), ("улугбек", 1), ("mirzo", 1),
    ("яккасарай", 2), ("yakkasaroy", 2),
    ("мирабад", 3), ("mirobod", 3),
    ("шайхантахур", 4), ("шайхантаур", 4), ("shayxonto", 4),
    ("чиланзар", 5), ("chilonzor", 5),
    ("алмазар", 6), ("almazar", 6),
    ("олмазор", 7), ("olmazor", 7),
    ("учтепа", 8), ("uchtepa", 8),
    ("яшнабад", 9), ("yashnobod", 9),
    ("сергели", 10), ("sergeli", 10),
    ("бектемир", 11), ("bektemir", 11),
]


def map_district(name: str):
    if not name:
        return None
    low = name.lower()
    for key, did in DISTRICT_MAP:
        if key in low:
            return did
    return None


def map_repair(label: str) -> str:
    """Map OLX repair label (RU) to our enum."""
    if not label:
        return "average"
    s = label.lower()
    if "евро" in s or "дизайн" in s or "автор" in s:
        return "euro"
    if "хорош" in s:
        return "good"
    if "средн" in s:
        return "average"
    if "требует" in s or "косметич" in s:
        return "needs_repair"
    if "без" in s or "черновая" in s or "предчистов" in s:
        return "without_repair"
    return "average"


def building_type_from_floors(total_floors: int) -> str:
    """OLX gives no building type; infer a reasonable value from height."""
    if total_floors <= 5:
        return "panel"
    if total_floors <= 9:
        return "brick"
    if total_floors <= 16:
        return "new"
    return "monolith"


def get_params(offer: dict) -> dict:
    out = {}
    for p in offer.get("params", []):
        out[p.get("key")] = p.get("value", {})
    return out


def price_to_usd(price_val: dict):
    if not price_val:
        return None
    cur = price_val.get("currency")
    if cur in ("UYE", "USD"):
        return price_val.get("value")
    # UZS or other -> use converted_value if present, else approx rate
    cv = price_val.get("converted_value")
    if cv:
        return cv
    if cur == "UZS" and price_val.get("value"):
        return round(price_val["value"] / 12600)
    return None


def num(v):
    try:
        return float(str(v).replace(" ", "").replace(",", "."))
    except (TypeError, ValueError):
        return None


def scrape(pages: int, out_path: str, sleep: float = 0.6):
    rows = []
    seen = set()
    kept = skipped = 0

    # OLX caps pagination near offset 1000. To collect more unique listings we
    # sweep several sort orders, each exposing a different 1000-item window.
    sort_orders = ["created_at:desc", "created_at:asc", "filter_float_price:asc",
                   "filter_float_price:desc", "relevance:desc"]

    for sort_by in sort_orders:
      for page in range(pages):
        params = {
            "offset": page * 50,
            "limit": 50,
            "category_id": CATEGORY_APARTMENTS,
            "region_id": REGION_TASHKENT,
            "sort_by": sort_by,
        }
        try:
            r = requests.get(API, params=params, headers=HEADERS, timeout=25)
            if r.status_code != 200:
                print(f"page {page}: HTTP {r.status_code}, stopping")
                break
            data = r.json().get("data", [])
        except Exception as e:
            print(f"page {page}: error {e}")
            time.sleep(2)
            continue

        if not data:
            print(f"page {page}: no more data")
            break

        for o in data:
            oid = o.get("id")
            if oid in seen:
                continue
            seen.add(oid)

            title = (o.get("title") or "").lower()
            # Skip obvious rentals
            if any(w in title for w in ["ijara", "аренд", "сдается", "сдаётся", "oylik", "kunlik", "посуточно"]):
                skipped += 1
                continue

            p = get_params(o)
            price_usd = price_to_usd(p.get("price"))
            rooms = num((p.get("number_of_rooms") or {}).get("key"))
            area = num((p.get("total_area") or {}).get("key"))
            floor = num((p.get("floor") or {}).get("key"))
            total_floors = num((p.get("total_floors") or {}).get("key"))
            repair_label = (p.get("repairs") or {}).get("label")

            loc = o.get("location", {})
            district_name = (loc.get("district") or {}).get("name") or ""
            district_id = map_district(district_name)

            # Validation / cleaning
            if None in (price_usd, rooms, area, floor, total_floors, district_id):
                skipped += 1
                continue
            if not (8000 <= price_usd <= 600000):   # keep sale-priced only
                skipped += 1
                continue
            if not (18 <= area <= 400) or not (1 <= rooms <= 7):
                skipped += 1
                continue
            if floor > total_floors or total_floors > 40:
                skipped += 1
                continue

            rooms = int(rooms)
            floor = int(floor)
            total_floors = int(total_floors)
            is_top = int(floor == total_floors)
            is_ground = int(floor == 1)
            building_type = building_type_from_floors(total_floors)
            repair = map_repair(repair_label)

            rows.append({
                "district_id": district_id,
                "district_name": district_name,
                "area_total": round(area, 1),
                "rooms": rooms,
                "floor": floor,
                "total_floors": total_floors,
                "is_top_floor": is_top,
                "is_ground_floor": is_ground,
                "floor_ratio": round(floor / total_floors, 4),
                "area_per_room": round(area / rooms, 2),
                "building_type": building_type,
                "repair_status": repair,
                "has_elevator": int(total_floors >= 5),
                "has_parking": 0,
                "has_balcony": 1,
                "price_usd": round(price_usd),
                "price_per_sqm": round(price_usd / area, 1),
                "source": "olx.uz",
                "url": o.get("url"),
            })
            kept += 1

        print(f"page {page+1}/{pages}: kept={kept} skipped={skipped}")
        time.sleep(sleep)

    # Write CSV
    if rows:
        fields = list(rows[0].keys())
        with open(out_path, "w", newline="", encoding="utf-8-sig") as f:
            w = csv.DictWriter(f, fieldnames=fields)
            w.writeheader()
            w.writerows(rows)
        print(f"\nSaved {len(rows)} REAL listings -> {out_path}")
    else:
        print("No rows collected.")
    return rows


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--pages", type=int, default=60)
    ap.add_argument("--out", default=os.path.join(os.path.dirname(__file__), "tashkent_real_estate_data.csv"))
    ap.add_argument("--sleep", type=float, default=0.6)
    args = ap.parse_args()
    scrape(args.pages, args.out, args.sleep)
