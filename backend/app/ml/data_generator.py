"""
Toshkent shahri uchun realistik ko'chmas mulk ma'lumotlarini generatsiya qilish.
Real bozor narxlariga asoslangan sintetik dataset.
"""
import numpy as np
import pandas as pd
import random

DISTRICTS = {
    0: {"name": "Yunusobod", "base_price": 1600, "std": 300, "elite": True},
    1: {"name": "Mirzo Ulugbek", "base_price": 1150, "std": 250, "elite": False},
    2: {"name": "Yakkasaroy", "base_price": 1400, "std": 350, "elite": True},
    3: {"name": "Mirobod", "base_price": 1300, "std": 280, "elite": False},
    4: {"name": "Shayxontohur", "base_price": 1050, "std": 220, "elite": False},
    5: {"name": "Chilonzor", "base_price": 950, "std": 200, "elite": False},
    6: {"name": "Almazar", "base_price": 900, "std": 180, "elite": False},
    7: {"name": "Olmazor", "base_price": 850, "std": 170, "elite": False},
    8: {"name": "Uchtepa", "base_price": 780, "std": 160, "elite": False},
    9: {"name": "Yashnobod", "base_price": 750, "std": 150, "elite": False},
    10: {"name": "Sergeli", "base_price": 680, "std": 140, "elite": False},
    11: {"name": "Bektemir", "base_price": 580, "std": 120, "elite": False},
}

BUILDING_TYPE_MULTIPLIER = {
    "monolith": 1.20,
    "brick": 1.10,
    "new": 1.15,
    "panel": 0.90,
    "old": 0.85,
}

REPAIR_MULTIPLIER = {
    "euro": 1.25,
    "good": 1.10,
    "average": 1.00,
    "needs_repair": 0.85,
    "without_repair": 0.75,
}


def generate_dataset(n_samples: int = 5000, seed: int = 42) -> pd.DataFrame:
    np.random.seed(seed)
    random.seed(seed)

    records = []
    for _ in range(n_samples):
        district_id = random.randint(0, 11)
        district = DISTRICTS[district_id]

        rooms = random.choices([1, 2, 3, 4, 5], weights=[20, 35, 30, 12, 3])[0]
        area_total = rooms * random.uniform(20, 38) + random.uniform(-10, 15)
        area_total = max(25, round(area_total, 1))

        total_floors = random.choices([5, 9, 12, 16, 20, 24], weights=[15, 25, 20, 20, 15, 5])[0]
        floor = random.randint(1, total_floors)
        is_top_floor = int(floor == total_floors)
        is_ground_floor = int(floor == 1)
        floor_ratio = floor / total_floors

        building_type = random.choices(
            list(BUILDING_TYPE_MULTIPLIER.keys()),
            weights=[25, 20, 20, 20, 15]
        )[0]

        repair = random.choices(
            list(REPAIR_MULTIPLIER.keys()),
            weights=[15, 25, 30, 20, 10]
        )[0]

        has_elevator = int(total_floors >= 5 and random.random() > 0.2)
        has_parking = int(random.random() > 0.6)
        has_balcony = int(random.random() > 0.3)

        base_price_per_sqm = np.random.normal(district["base_price"], district["std"])
        base_price_per_sqm = max(300, base_price_per_sqm)

        price_per_sqm = base_price_per_sqm
        price_per_sqm *= BUILDING_TYPE_MULTIPLIER[building_type]
        price_per_sqm *= REPAIR_MULTIPLIER[repair]

        if is_ground_floor:
            price_per_sqm *= 0.90
        if is_top_floor and has_elevator:
            price_per_sqm *= 1.05
        elif is_top_floor:
            price_per_sqm *= 0.92

        if has_elevator:
            price_per_sqm *= 1.03
        if has_parking:
            price_per_sqm *= 1.04
        if has_balcony:
            price_per_sqm *= 1.02

        if area_total > 100:
            price_per_sqm *= 1.08
        elif area_total < 40:
            price_per_sqm *= 0.95

        price_usd = price_per_sqm * area_total
        noise = np.random.normal(0, price_usd * 0.05)
        price_usd = max(10000, price_usd + noise)
        price_usd = round(price_usd / 500) * 500

        records.append({
            "district_id": district_id,
            "district_name": district["name"],
            "area_total": area_total,
            "rooms": rooms,
            "floor": floor,
            "total_floors": total_floors,
            "is_top_floor": is_top_floor,
            "is_ground_floor": is_ground_floor,
            "floor_ratio": floor_ratio,
            "area_per_room": area_total / rooms,
            "building_type": building_type,
            "repair_status": repair,
            "has_elevator": has_elevator,
            "has_parking": has_parking,
            "has_balcony": has_balcony,
            "price_usd": price_usd,
            "price_per_sqm": price_usd / area_total,
        })

    return pd.DataFrame(records)


if __name__ == "__main__":
    df = generate_dataset(5000)
    print(df.describe())
    print("\nDistrict average prices (USD/m²):")
    print(df.groupby("district_name")["price_per_sqm"].mean().sort_values(ascending=False).round(0))
    df.to_csv("tashkent_real_estate_data.csv", index=False)
    print(f"\nDataset saved: {len(df)} records")
