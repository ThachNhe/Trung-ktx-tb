"""Seed data cho development/staging."""

import asyncio
import os
import sys
from datetime import date, datetime, timezone
from decimal import Decimal

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants.enums import (
    BuildingCode,
    BuildingStatus,
    Gender,
    InvoiceStatus,
    MaintenanceRequestStatus,
    Nationality,
    NotificationTargetRole,
    RoomRegistrationStatus,
    RoomStatus,
    RoomType,
    UserRole,
)
from app.core.database import AsyncSessionLocal
from app.models import (
    Building,
    Invoice,
    MaintenanceRequest,
    Notification,
    Room,
    RoomRegistration,
    User,
)
from app.utils.security import hash_password

ELEC_RATE = Decimal("3500")   # dong / kWh
WATER_RATE = Decimal("15000")  # dong / m3

# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------
SEED_USERS = [
    # System accounts
    {
        "email": "admin@utb.edu.vn", "password": "Admin@123",
        "full_name": "Quan tri he thong", "student_code": "AD0001",
        "phone": "0901000001", "role": UserRole.ADMIN,
        "gender": Gender.OTHER, "nationality": Nationality.VIETNAM,
    },
    {
        "email": "staff1@utb.edu.vn", "password": "Staff@123",
        "full_name": "Nguyen Van Quan", "student_code": "CB0001",
        "phone": "0901000002", "role": UserRole.STAFF,
        "gender": Gender.MALE, "nationality": Nationality.VIETNAM,
    },
    {
        "email": "staff2@utb.edu.vn", "password": "Staff@123",
        "full_name": "Tran Thi Hanh", "student_code": "CB0002",
        "phone": "0901000003", "role": UserRole.STAFF,
        "gender": Gender.FEMALE, "nationality": Nationality.VIETNAM,
    },
    # Male Vietnamese students (K1)
    {"email": "sv001@utb.edu.vn", "password": "Student@123", "full_name": "Lo Van A",               "student_code": "SV0001", "phone": "0901100001", "role": UserRole.STUDENT, "gender": Gender.MALE,   "nationality": Nationality.VIETNAM},
    {"email": "sv002@utb.edu.vn", "password": "Student@123", "full_name": "Vi Van Long",             "student_code": "SV0002", "phone": "0901100002", "role": UserRole.STUDENT, "gender": Gender.MALE,   "nationality": Nationality.VIETNAM},
    {"email": "sv003@utb.edu.vn", "password": "Student@123", "full_name": "Cam Van Minh",            "student_code": "SV0003", "phone": "0901100003", "role": UserRole.STUDENT, "gender": Gender.MALE,   "nationality": Nationality.VIETNAM},
    {"email": "sv004@utb.edu.vn", "password": "Student@123", "full_name": "Luong Van Son",           "student_code": "SV0004", "phone": "0901100004", "role": UserRole.STUDENT, "gender": Gender.MALE,   "nationality": Nationality.VIETNAM},
    {"email": "sv005@utb.edu.vn", "password": "Student@123", "full_name": "Ha Van Tuan",             "student_code": "SV0005", "phone": "0901100005", "role": UserRole.STUDENT, "gender": Gender.MALE,   "nationality": Nationality.VIETNAM},
    {"email": "sv006@utb.edu.vn", "password": "Student@123", "full_name": "Bui Van Khanh",           "student_code": "SV0006", "phone": "0901100006", "role": UserRole.STUDENT, "gender": Gender.MALE,   "nationality": Nationality.VIETNAM},
    {"email": "sv007@utb.edu.vn", "password": "Student@123", "full_name": "Dieu Van Binh",           "student_code": "SV0007", "phone": "0901100007", "role": UserRole.STUDENT, "gender": Gender.MALE,   "nationality": Nationality.VIETNAM},
    {"email": "sv008@utb.edu.vn", "password": "Student@123", "full_name": "Mua A Tu",                "student_code": "SV0008", "phone": "0901100008", "role": UserRole.STUDENT, "gender": Gender.MALE,   "nationality": Nationality.VIETNAM},
    {"email": "sv009@utb.edu.vn", "password": "Student@123", "full_name": "Tong Van Hieu",           "student_code": "SV0009", "phone": "0901100009", "role": UserRole.STUDENT, "gender": Gender.MALE,   "nationality": Nationality.VIETNAM},
    # Female Vietnamese students (K2)
    {"email": "sv010@utb.edu.vn", "password": "Student@123", "full_name": "Luong Thi B",             "student_code": "SV0010", "phone": "0901100010", "role": UserRole.STUDENT, "gender": Gender.FEMALE, "nationality": Nationality.VIETNAM},
    {"email": "sv011@utb.edu.vn", "password": "Student@123", "full_name": "Dieu Thi Hoa",            "student_code": "SV0011", "phone": "0901100011", "role": UserRole.STUDENT, "gender": Gender.FEMALE, "nationality": Nationality.VIETNAM},
    {"email": "sv012@utb.edu.vn", "password": "Student@123", "full_name": "Ha Thi Lan",              "student_code": "SV0012", "phone": "0901100012", "role": UserRole.STUDENT, "gender": Gender.FEMALE, "nationality": Nationality.VIETNAM},
    {"email": "sv013@utb.edu.vn", "password": "Student@123", "full_name": "Cam Thi Phuong",          "student_code": "SV0013", "phone": "0901100013", "role": UserRole.STUDENT, "gender": Gender.FEMALE, "nationality": Nationality.VIETNAM},
    {"email": "sv014@utb.edu.vn", "password": "Student@123", "full_name": "Vi Thi Thu",              "student_code": "SV0014", "phone": "0901100014", "role": UserRole.STUDENT, "gender": Gender.FEMALE, "nationality": Nationality.VIETNAM},
    {"email": "sv015@utb.edu.vn", "password": "Student@123", "full_name": "Tong Thi Lien",           "student_code": "SV0015", "phone": "0901100015", "role": UserRole.STUDENT, "gender": Gender.FEMALE, "nationality": Nationality.VIETNAM},
    {"email": "sv016@utb.edu.vn", "password": "Student@123", "full_name": "Lo Thi Ngoc",             "student_code": "SV0016", "phone": "0901100016", "role": UserRole.STUDENT, "gender": Gender.FEMALE, "nationality": Nationality.VIETNAM},
    {"email": "sv017@utb.edu.vn", "password": "Student@123", "full_name": "Bui Thi Nhung",           "student_code": "SV0017", "phone": "0901100017", "role": UserRole.STUDENT, "gender": Gender.FEMALE, "nationality": Nationality.VIETNAM},
    # Laos students (K3)
    {"email": "sv018@utb.edu.vn", "password": "Student@123", "full_name": "Giang A C",               "student_code": "SV0018", "phone": "0901100018", "role": UserRole.STUDENT, "gender": Gender.MALE,   "nationality": Nationality.LAOS},
    {"email": "sv019@utb.edu.vn", "password": "Student@123", "full_name": "Khamla Phommachanh",       "student_code": "SV0019", "phone": "0901100019", "role": UserRole.STUDENT, "gender": Gender.MALE,   "nationality": Nationality.LAOS},
    {"email": "sv020@utb.edu.vn", "password": "Student@123", "full_name": "Bounmy Vongkhamphanh",     "student_code": "SV0020", "phone": "0901100020", "role": UserRole.STUDENT, "gender": Gender.MALE,   "nationality": Nationality.LAOS},
    {"email": "sv021@utb.edu.vn", "password": "Student@123", "full_name": "Mua Thi D",               "student_code": "SV0021", "phone": "0901100021", "role": UserRole.STUDENT, "gender": Gender.FEMALE, "nationality": Nationality.LAOS},
    {"email": "sv022@utb.edu.vn", "password": "Student@123", "full_name": "Phonesavanh Xayyavong",    "student_code": "SV0022", "phone": "0901100022", "role": UserRole.STUDENT, "gender": Gender.FEMALE, "nationality": Nationality.LAOS},
    {"email": "sv023@utb.edu.vn", "password": "Student@123", "full_name": "Bouakham Sithixay",        "student_code": "SV0023", "phone": "0901100023", "role": UserRole.STUDENT, "gender": Gender.FEMALE, "nationality": Nationality.LAOS},
    # Extra students for PENDING / CHECKED_OUT demo
    {"email": "sv024@utb.edu.vn", "password": "Student@123", "full_name": "Sung A Pao",              "student_code": "SV0024", "phone": "0901100024", "role": UserRole.STUDENT, "gender": Gender.MALE,   "nationality": Nationality.VIETNAM},
    {"email": "sv025@utb.edu.vn", "password": "Student@123", "full_name": "Mua Van Phong",           "student_code": "SV0025", "phone": "0901100025", "role": UserRole.STUDENT, "gender": Gender.MALE,   "nationality": Nationality.VIETNAM},
    {"email": "sv026@utb.edu.vn", "password": "Student@123", "full_name": "Hoang Van Minh",          "student_code": "SV0026", "phone": "0901100026", "role": UserRole.STUDENT, "gender": Gender.MALE,   "nationality": Nationality.VIETNAM},
    {"email": "sv027@utb.edu.vn", "password": "Student@123", "full_name": "Lo Thi Huong",            "student_code": "SV0027", "phone": "0901100027", "role": UserRole.STUDENT, "gender": Gender.FEMALE, "nationality": Nationality.VIETNAM},
]

# ---------------------------------------------------------------------------
# Buildings
# K1 (MALE)         : 34 rooms/floor x 5 floors x 6 capacity = 1 020 spots
# K2 (FEMALE)       : 34 rooms/floor x 5 floors x 6 capacity = 1 020 spots
# K3 (LAOS_STUDENT) : 17 rooms/floor x 5 floors x 6 capacity =   510 spots
# Room numbering    : "{floor}{room_idx:02d}"  e.g. "101", "134", "201", ...
# ---------------------------------------------------------------------------
BUILDING_CONFIGS = [
    {
        "code": BuildingCode.K1,
        "description": "Khu K1 danh cho sinh vien nam",
        "room_type": RoomType.MALE,
        "total_floors": 5,
        "rooms_per_floor": 34,
        "price": Decimal("450000"),
    },
    {
        "code": BuildingCode.K2,
        "description": "Khu K2 danh cho sinh vien nu",
        "room_type": RoomType.FEMALE,
        "total_floors": 5,
        "rooms_per_floor": 34,
        "price": Decimal("470000"),
    },
    {
        "code": BuildingCode.K3,
        "description": "Khu K3 danh cho luu hoc sinh Lao",
        "room_type": RoomType.LAOS_STUDENT,
        "total_floors": 5,
        "rooms_per_floor": 17,
        "price": Decimal("460000"),
    },
]

# Convenient price lookup by building code
_PRICE_BY_CODE: dict[BuildingCode, Decimal] = {
    c["code"]: c["price"] for c in BUILDING_CONFIGS
}


# ---------------------------------------------------------------------------
# seed_users
# ---------------------------------------------------------------------------
async def seed_users(db: AsyncSession) -> None:
    for data in SEED_USERS:
        existing = await db.execute(select(User).where(User.email == data["email"]))
        if existing.scalar_one_or_none():
            print(f"  skip user: {data['email']}")
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
        print(f"  + user: {data['email']} [{data['role'].value}]")


# ---------------------------------------------------------------------------
# seed_buildings_and_rooms
# ---------------------------------------------------------------------------
async def seed_buildings_and_rooms(db: AsyncSession) -> None:
    building_objs: dict[BuildingCode, Building] = {}

    for cfg in BUILDING_CONFIGS:
        existing = await db.execute(select(Building).where(Building.name == cfg["code"]))
        building = existing.scalar_one_or_none()
        if not building:
            building = Building(
                name=cfg["code"],
                total_floors=cfg["total_floors"],
                description=cfg["description"],
                status=BuildingStatus.ACTIVE,
            )
            db.add(building)
            print(f"  + building: {cfg['code'].value}")
        else:
            print(f"  skip building: {cfg['code'].value}")
        building_objs[cfg["code"]] = building

    await db.flush()

    for cfg in BUILDING_CONFIGS:
        building = building_objs[cfg["code"]]
        created = 0
        for floor in range(1, cfg["total_floors"] + 1):
            for room_idx in range(1, cfg["rooms_per_floor"] + 1):
                room_number = f"{floor}{room_idx:02d}"
                existing_room = await db.execute(
                    select(Room).where(
                        Room.building_id == building.id,
                        Room.room_number == room_number,
                    )
                )
                if existing_room.scalar_one_or_none():
                    continue
                db.add(Room(
                    building_id=building.id,
                    room_number=room_number,
                    floor=floor,
                    capacity=6,
                    current_occupancy=0,
                    room_type=cfg["room_type"],
                    price_per_month=cfg["price"],
                    status=RoomStatus.AVAILABLE,
                ))
                created += 1
        if created:
            print(f"  + {created} rooms for {cfg['code'].value}")
        else:
            print(f"  skip rooms: {cfg['code'].value} (already exist)")


# ---------------------------------------------------------------------------
# seed_activity  (registrations, invoices, maintenance, notifications)
# ---------------------------------------------------------------------------
async def seed_activity(db: AsyncSession) -> None:
    await db.flush()

    async def get_user(email: str) -> User | None:
        r = await db.execute(select(User).where(User.email == email))
        return r.scalar_one_or_none()

    async def get_room(bcode: BuildingCode, rnum: str) -> Room | None:
        r = await db.execute(
            select(Room)
            .join(Building)
            .where(Building.name == bcode, Room.room_number == rnum)
        )
        return r.scalar_one_or_none()

    # ---- Registrations ----
    START      = date(2024, 9, 1);  END      = date(2025, 8, 31)
    START_OLD  = date(2023, 9, 1);  END_OLD  = date(2024, 8, 31)
    START_NEW  = date(2025, 9, 1);  END_NEW  = date(2026, 8, 31)

    REG_CONFIGS = [
        # K1-101  6 male VN  -> FULL
        ("sv001@utb.edu.vn", BuildingCode.K1, "101", RoomRegistrationStatus.APPROVED, START, END),
        ("sv002@utb.edu.vn", BuildingCode.K1, "101", RoomRegistrationStatus.APPROVED, START, END),
        ("sv003@utb.edu.vn", BuildingCode.K1, "101", RoomRegistrationStatus.APPROVED, START, END),
        ("sv004@utb.edu.vn", BuildingCode.K1, "101", RoomRegistrationStatus.APPROVED, START, END),
        ("sv005@utb.edu.vn", BuildingCode.K1, "101", RoomRegistrationStatus.APPROVED, START, END),
        ("sv006@utb.edu.vn", BuildingCode.K1, "101", RoomRegistrationStatus.APPROVED, START, END),
        # K1-102  3 male VN  -> partial (3/6)
        ("sv007@utb.edu.vn", BuildingCode.K1, "102", RoomRegistrationStatus.APPROVED, START, END),
        ("sv008@utb.edu.vn", BuildingCode.K1, "102", RoomRegistrationStatus.APPROVED, START, END),
        ("sv009@utb.edu.vn", BuildingCode.K1, "102", RoomRegistrationStatus.APPROVED, START, END),
        # K2-101  6 female VN  -> FULL
        ("sv010@utb.edu.vn", BuildingCode.K2, "101", RoomRegistrationStatus.APPROVED, START, END),
        ("sv011@utb.edu.vn", BuildingCode.K2, "101", RoomRegistrationStatus.APPROVED, START, END),
        ("sv012@utb.edu.vn", BuildingCode.K2, "101", RoomRegistrationStatus.APPROVED, START, END),
        ("sv013@utb.edu.vn", BuildingCode.K2, "101", RoomRegistrationStatus.APPROVED, START, END),
        ("sv014@utb.edu.vn", BuildingCode.K2, "101", RoomRegistrationStatus.APPROVED, START, END),
        ("sv015@utb.edu.vn", BuildingCode.K2, "101", RoomRegistrationStatus.APPROVED, START, END),
        # K2-102  2 female VN  -> partial (2/6)
        ("sv016@utb.edu.vn", BuildingCode.K2, "102", RoomRegistrationStatus.APPROVED, START, END),
        ("sv017@utb.edu.vn", BuildingCode.K2, "102", RoomRegistrationStatus.APPROVED, START, END),
        # K3-101  6 Laos students  -> FULL
        ("sv018@utb.edu.vn", BuildingCode.K3, "101", RoomRegistrationStatus.APPROVED, START, END),
        ("sv019@utb.edu.vn", BuildingCode.K3, "101", RoomRegistrationStatus.APPROVED, START, END),
        ("sv020@utb.edu.vn", BuildingCode.K3, "101", RoomRegistrationStatus.APPROVED, START, END),
        ("sv021@utb.edu.vn", BuildingCode.K3, "101", RoomRegistrationStatus.APPROVED, START, END),
        ("sv022@utb.edu.vn", BuildingCode.K3, "101", RoomRegistrationStatus.APPROVED, START, END),
        ("sv023@utb.edu.vn", BuildingCode.K3, "101", RoomRegistrationStatus.APPROVED, START, END),
        # PENDING  -> waiting for approval
        ("sv024@utb.edu.vn", BuildingCode.K1, "103", RoomRegistrationStatus.PENDING,  START_NEW, END_NEW),
        ("sv025@utb.edu.vn", BuildingCode.K1, "103", RoomRegistrationStatus.PENDING,  START_NEW, END_NEW),
        # CHECKED_OUT  -> historical occupants who have left
        ("sv026@utb.edu.vn", BuildingCode.K1, "102", RoomRegistrationStatus.CHECKED_OUT, START_OLD, END_OLD),
        ("sv027@utb.edu.vn", BuildingCode.K2, "102", RoomRegistrationStatus.CHECKED_OUT, START_OLD, END_OLD),
    ]

    occupancy_delta: dict[int, int] = {}

    for (email, bcode, rnum, status, start, end) in REG_CONFIGS:
        student = await get_user(email)
        room    = await get_room(bcode, rnum)
        if not student or not room:
            print(f"  WARN: user/room not found: {email} -> {bcode.value}-{rnum}")
            continue
        existing = await db.execute(
            select(RoomRegistration).where(
                RoomRegistration.student_id == student.id,
                RoomRegistration.room_id    == room.id,
            )
        )
        if existing.scalar_one_or_none():
            print(f"  skip reg: {email} -> {bcode.value}-{rnum}")
            continue
        db.add(RoomRegistration(
            student_id=student.id,
            room_id=room.id,
            start_date=start,
            end_date=end,
            status=status,
        ))
        print(f"  + reg: {email} -> {bcode.value}-{rnum} [{status.value}]")
        if status == RoomRegistrationStatus.APPROVED:
            occupancy_delta[room.id] = occupancy_delta.get(room.id, 0) + 1

    await db.flush()

    for room_id, delta in occupancy_delta.items():
        r = await db.execute(select(Room).where(Room.id == room_id))
        room = r.scalar_one_or_none()
        if room:
            room.current_occupancy = delta
            room.status = RoomStatus.FULL if delta >= room.capacity else RoomStatus.AVAILABLE
            print(f"  update room {room.room_number}: occupancy={delta} [{room.status.value}]")

    # ---- Invoices ----
    # 3 months for each approved student: Feb+Mar 2026 PAID, Apr 2026 UNPAID
    APPROVED_ROOMS = [
        ("sv001@utb.edu.vn", BuildingCode.K1, "101"),
        ("sv002@utb.edu.vn", BuildingCode.K1, "101"),
        ("sv003@utb.edu.vn", BuildingCode.K1, "101"),
        ("sv004@utb.edu.vn", BuildingCode.K1, "101"),
        ("sv005@utb.edu.vn", BuildingCode.K1, "101"),
        ("sv006@utb.edu.vn", BuildingCode.K1, "101"),
        ("sv007@utb.edu.vn", BuildingCode.K1, "102"),
        ("sv008@utb.edu.vn", BuildingCode.K1, "102"),
        ("sv009@utb.edu.vn", BuildingCode.K1, "102"),
        ("sv010@utb.edu.vn", BuildingCode.K2, "101"),
        ("sv011@utb.edu.vn", BuildingCode.K2, "101"),
        ("sv012@utb.edu.vn", BuildingCode.K2, "101"),
        ("sv013@utb.edu.vn", BuildingCode.K2, "101"),
        ("sv014@utb.edu.vn", BuildingCode.K2, "101"),
        ("sv015@utb.edu.vn", BuildingCode.K2, "101"),
        ("sv016@utb.edu.vn", BuildingCode.K2, "102"),
        ("sv017@utb.edu.vn", BuildingCode.K2, "102"),
        ("sv018@utb.edu.vn", BuildingCode.K3, "101"),
        ("sv019@utb.edu.vn", BuildingCode.K3, "101"),
        ("sv020@utb.edu.vn", BuildingCode.K3, "101"),
        ("sv021@utb.edu.vn", BuildingCode.K3, "101"),
        ("sv022@utb.edu.vn", BuildingCode.K3, "101"),
        ("sv023@utb.edu.vn", BuildingCode.K3, "101"),
    ]

    # (month, year, elec_kwh, water_m3, status)
    MONTHS = [
        (2, 2026, Decimal("75"), Decimal("4"), InvoiceStatus.PAID),
        (3, 2026, Decimal("78"), Decimal("4"), InvoiceStatus.PAID),
        (4, 2026, Decimal("80"), Decimal("5"), InvoiceStatus.UNPAID),
    ]

    invoice_count = 0
    for (email, bcode, rnum) in APPROVED_ROOMS:
        student = await get_user(email)
        room    = await get_room(bcode, rnum)
        if not student or not room:
            continue
        for (month, year, elec_kwh, water_m3, inv_status) in MONTHS:
            existing = await db.execute(
                select(Invoice).where(
                    Invoice.student_id == student.id,
                    Invoice.room_id    == room.id,
                    Invoice.month      == month,
                    Invoice.year       == year,
                )
            )
            if existing.scalar_one_or_none():
                continue
            room_fee  = _PRICE_BY_CODE[bcode]
            elec_fee  = elec_kwh * ELEC_RATE
            water_fee = water_m3 * WATER_RATE
            total     = room_fee + elec_fee + water_fee
            pay_month = month + 1 if month < 12 else 1
            pay_year  = year if month < 12 else year + 1
            paid_at   = (
                datetime(pay_year, pay_month, 5, 10, 0, 0, tzinfo=timezone.utc)
                if inv_status == InvoiceStatus.PAID
                else None
            )
            db.add(Invoice(
                student_id=student.id,
                room_id=room.id,
                month=month,
                year=year,
                electricity_used_kwh=elec_kwh,
                water_used_m3=water_m3,
                room_fee=room_fee,
                electricity_fee=elec_fee,
                water_fee=water_fee,
                total_amount=total,
                status=inv_status,
                due_date=date(year, pay_month, 15),
                paid_at=paid_at,
            ))
            invoice_count += 1
    if invoice_count:
        print(f"  + {invoice_count} invoices")
    else:
        print("  skip invoices (already exist)")

    # ---- Maintenance requests ----
    MAINT_DATA = [
        {
            "email": "sv001@utb.edu.vn",
            "bcode": BuildingCode.K1, "rnum": "101",
            "title": "Quat tran phong 101 bi hong",
            "description": "Quat tran trong phong 101 bi hong tu ngay 10/03/2026, de nghi sua chua.",
            "status": MaintenanceRequestStatus.RESOLVED,
            "resolved_at": datetime(2026, 3, 15, 9, 0, tzinfo=timezone.utc),
        },
        {
            "email": "sv007@utb.edu.vn",
            "bcode": BuildingCode.K1, "rnum": "102",
            "title": "Den hanh lang tang 1 bi chay bong",
            "description": "Bong den hanh lang tang 1 day A bi chay, de nghi thay moi.",
            "status": MaintenanceRequestStatus.RESOLVED,
            "resolved_at": datetime(2026, 4, 2, 14, 30, tzinfo=timezone.utc),
        },
        {
            "email": "sv010@utb.edu.vn",
            "bcode": BuildingCode.K2, "rnum": "101",
            "title": "Voi nuoc phong 101 K2 bi ro ri",
            "description": "Voi nuoc trong nha ve sinh phong 101 tang 1 bi ro ri, gay uot san.",
            "status": MaintenanceRequestStatus.IN_PROGRESS,
            "resolved_at": None,
        },
        {
            "email": "sv018@utb.edu.vn",
            "bcode": BuildingCode.K3, "rnum": "101",
            "title": "Cua phong 101 K3 bi hong khoa",
            "description": "O khoa cua phong 101 K3 bi ket, khong dong mo duoc binh thuong.",
            "status": MaintenanceRequestStatus.PENDING,
            "resolved_at": None,
        },
    ]
    for m in MAINT_DATA:
        student = await get_user(m["email"])
        room    = await get_room(m["bcode"], m["rnum"])
        if not student or not room:
            continue
        existing = await db.execute(
            select(MaintenanceRequest).where(
                MaintenanceRequest.student_id == student.id,
                MaintenanceRequest.title      == m["title"],
            )
        )
        if existing.scalar_one_or_none():
            print(f"  skip maintenance: {m['title'][:50]}")
            continue
        db.add(MaintenanceRequest(
            student_id=student.id,
            room_id=room.id,
            title=m["title"],
            description=m["description"],
            status=m["status"],
            resolved_at=m["resolved_at"],
        ))
        print(f"  + maintenance: {m['title'][:50]} [{m['status'].value}]")

    # ---- Notifications ----
    staff1 = await get_user("staff1@utb.edu.vn")
    admin  = await get_user("admin@utb.edu.vn")
    NOTIF_DATA = [
        {
            "title": "Thong bao dong tien phong thang 5/2026",
            "content": (
                "De nghi toan the sinh vien noi tru thanh toan tien phong, tien dien va tien nuoc "
                "thang 5/2026 truoc ngay 15/05/2026. Vui long kiem tra hoa don trong he thong."
            ),
            "target_role": NotificationTargetRole.STUDENT,
            "creator": staff1,
        },
        {
            "title": "Noi quy gio giac ra vao ky tuc xa",
            "content": (
                "Ke tu ngay 01/05/2026, gio dong cong ky tuc xa la 23h00 hang ngay. "
                "Sinh vien ve muon vui long lien he bao ve truc va dang ky tai ban quan ly."
            ),
            "target_role": NotificationTargetRole.ALL,
            "creator": admin,
        },
        {
            "title": "Hop can bo quan ly thang 5/2026",
            "content": (
                "Moi toan the can bo nhan vien Ban Quan ly khu noi tru tham du hop giao ban "
                "thang 5/2026 vao luc 14h00 ngay 06/05/2026 tai phong hop K2."
            ),
            "target_role": NotificationTargetRole.STAFF,
            "creator": admin,
        },
    ]
    for n in NOTIF_DATA:
        if not n["creator"]:
            continue
        existing = await db.execute(
            select(Notification).where(Notification.title == n["title"])
        )
        if existing.scalar_one_or_none():
            print(f"  skip notif: {n['title'][:50]}")
            continue
        db.add(Notification(
            title=n["title"],
            content=n["content"],
            target_role=n["target_role"],
            created_by=n["creator"].id,
        ))
        print(f"  + notif: {n['title'][:50]} [{n['target_role'].value}]")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
async def seed(db: AsyncSession) -> None:
    await seed_users(db)
    await seed_buildings_and_rooms(db)
    await seed_activity(db)
    await db.commit()


async def main() -> None:
    print("Bat dau seed data...")
    async with AsyncSessionLocal() as db:
        await seed(db)
    print("Seed data hoan tat!")


if __name__ == "__main__":
    asyncio.run(main())
