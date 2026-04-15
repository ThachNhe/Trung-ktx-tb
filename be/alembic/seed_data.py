"""Seed data cho development/staging."""

import asyncio
import os
import sys
from decimal import Decimal

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants.enums import BuildingCode, BuildingStatus, Gender, Nationality, RoomStatus, RoomType, UserRole
from app.core.database import AsyncSessionLocal
from app.models import Building, Room, User
from app.utils.security import hash_password


SEED_USERS = [
    {
        "email": "admin@utb.edu.vn",
        "password": "Admin@123",
        "full_name": "Quản trị hệ thống",
        "student_code": "AD0001",
        "phone": "0901000001",
        "role": UserRole.ADMIN,
        "gender": Gender.OTHER,
    },
    {
        "email": "staff1@utb.edu.vn",
        "password": "Staff@123",
        "full_name": "Nguyễn Văn Quản",
        "student_code": "CB0001",
        "phone": "0901000002",
        "role": UserRole.STAFF,
        "gender": Gender.MALE,
    },
    {
        "email": "staff2@utb.edu.vn",
        "password": "Staff@123",
        "full_name": "Trần Thị Hạnh",
        "student_code": "CB0002",
        "phone": "0901000003",
        "role": UserRole.STAFF,
        "gender": Gender.FEMALE,
    },
    {
        "email": "sv1@utb.edu.vn",
        "password": "Student@123",
        "full_name": "Lò Văn A",
        "student_code": "SV0001",
        "phone": "0901000004",
        "role": UserRole.STUDENT,
        "gender": Gender.MALE,
        "nationality": Nationality.VIETNAM,
    },
    {
        "email": "sv2@utb.edu.vn",
        "password": "Student@123",
        "full_name": "Lường Thị B",
        "student_code": "SV0002",
        "phone": "0901000005",
        "role": UserRole.STUDENT,
        "gender": Gender.FEMALE,
        "nationality": Nationality.VIETNAM,
    },
    {
        "email": "sv3@utb.edu.vn",
        "password": "Student@123",
        "full_name": "Giàng A C",
        "student_code": "SV0003",
        "phone": "0901000006",
        "role": UserRole.STUDENT,
        "gender": Gender.MALE,
        "nationality": Nationality.LAOS,
    },
    {
        "email": "sv4@utb.edu.vn",
        "password": "Student@123",
        "full_name": "Mùa Thị D",
        "student_code": "SV0004",
        "phone": "0901000007",
        "role": UserRole.STUDENT,
        "gender": Gender.FEMALE,
        "nationality": Nationality.LAOS,
    },
    {
        "email": "sv5@utb.edu.vn",
        "password": "Student@123",
        "full_name": "Sùng A E",
        "student_code": "SV0005",
        "phone": "0901000008",
        "role": UserRole.STUDENT,
        "gender": Gender.MALE,
        "nationality": Nationality.VIETNAM,
    },
]

BUILDING_SEEDS = [
    {"name": BuildingCode.K1, "total_floors": 5, "description": "Khu K1 dành cho sinh viên nam", "room_type": RoomType.MALE, "price": Decimal("450000")},
    {"name": BuildingCode.K2, "total_floors": 5, "description": "Khu K2 dành cho sinh viên nữ", "room_type": RoomType.FEMALE, "price": Decimal("470000")},
    {"name": BuildingCode.K3, "total_floors": 5, "description": "Khu K3 dành cho lưu học sinh Lào", "room_type": RoomType.LAOS_STUDENT, "price": Decimal("460000")},
]


async def seed_users(db: AsyncSession) -> None:
    for data in SEED_USERS:
        existing = await db.execute(select(User).where(User.email == data["email"]))
        if existing.scalar_one_or_none():
            print(f"  ⏭  Bỏ qua user: {data['email']}")
            continue

        user = User(
            email=data["email"],
            password_hash=hash_password(data["password"]),
            full_name=data["full_name"],
            student_code=data["student_code"],
            phone=data["phone"],
            role=data["role"],
            gender=data["gender"],
            nationality=data["nationality"],
        )
        db.add(user)
        print(f"  ✅ Tạo user: {data['email']} [{data['role'].value}]")


async def seed_buildings_and_rooms(db: AsyncSession) -> None:
    building_rows: list[Building] = []

    for index, data in enumerate(BUILDING_SEEDS, start=1):
        existing = await db.execute(select(Building).where(Building.name == data["name"]))
        building = existing.scalar_one_or_none()
        if not building:
            building = Building(
                name=data["name"],
                total_floors=data["total_floors"],
                description=data["description"],
                status=BuildingStatus.ACTIVE,
            )
            db.add(building)
            print(f"  ✅ Tạo building: {data['name'].value}")
        else:
            print(f"  ⏭  Bỏ qua building: {data['name'].value}")
        building_rows.append(building)

    await db.flush()

    for building_index, building in enumerate(building_rows, start=1):
        for room_index in range(1, 11):
            room_number = f"{building_index}0{room_index}"
            existing_room = await db.execute(
                select(Room).where(Room.building_id == building.id, Room.room_number == room_number)
            )
            if existing_room.scalar_one_or_none():
                print(f"  ⏭  Bỏ qua phòng: {building.name.value}-{room_number}")
                continue

            floor = 1 + (room_index - 1) // 2
            room = Room(
                building_id=building.id,
                room_number=room_number,
                floor=floor,
                capacity=6,
                current_occupancy=0,
                room_type=BUILDING_SEEDS[building_index - 1]["room_type"],
                price_per_month=BUILDING_SEEDS[building_index - 1]["price"],
                status=RoomStatus.AVAILABLE,
            )
            db.add(room)
            print(f"  ✅ Tạo phòng: {building.name.value}-{room_number}")


async def seed(db: AsyncSession) -> None:
    await seed_users(db)
    await seed_buildings_and_rooms(db)
    await db.commit()


async def main() -> None:
    print("🌱 Bắt đầu seed data...")
    async with AsyncSessionLocal() as db:
        await seed(db)
    print("✅ Seed data hoàn tất!")


if __name__ == "__main__":
    asyncio.run(main())
