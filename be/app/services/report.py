from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.constants.enums import InvoiceStatus
from app.models.building import Building
from app.models.invoice import Invoice
from app.models.room import Room
from app.schemas.report import MonthlyBuildingReportResponse, MonthlyReportResponse


class ReportService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_monthly_report(self, month: int, year: int) -> MonthlyReportResponse:
        invoices_result = await self.db.execute(
            select(Invoice)
            .options(selectinload(Invoice.room).selectinload(Room.building))
            .where(Invoice.month == month, Invoice.year == year)
        )
        invoices = list(invoices_result.scalars().all())

        rooms_result = await self.db.execute(
            select(Room)
            .options(selectinload(Room.building))
            .order_by(Room.building_id, Room.floor, Room.room_number)
        )
        rooms = list(rooms_result.scalars().all())

        buildings_result = await self.db.execute(select(Building).order_by(Building.id))
        buildings = list(buildings_result.scalars().all())

        total_revenue = sum(
            (invoice.total_amount for invoice in invoices if invoice.status == InvoiceStatus.PAID),
            Decimal("0"),
        )
        paid_invoices = sum(1 for invoice in invoices if invoice.status == InvoiceStatus.PAID)
        unpaid_invoices = sum(1 for invoice in invoices if invoice.status != InvoiceStatus.PAID)

        total_capacity = sum(room.capacity for room in rooms)
        occupied_beds = sum(room.current_occupancy for room in rooms)
        occupancy_rate = int(round((occupied_beds / total_capacity) * 100)) if total_capacity else 0

        building_reports: list[MonthlyBuildingReportResponse] = []
        for building in buildings:
            building_rooms = [room for room in rooms if room.building_id == building.id]
            building_capacity = sum(room.capacity for room in building_rooms)
            building_occupied = sum(room.current_occupancy for room in building_rooms)
            building_reports.append(
                MonthlyBuildingReportResponse(
                    building_id=building.id,
                    building_name=building.name,
                    total_rooms=len(building_rooms),
                    total_capacity=building_capacity,
                    occupied_beds=building_occupied,
                    occupancy_rate=int(round((building_occupied / building_capacity) * 100)) if building_capacity else 0,
                )
            )

        return MonthlyReportResponse(
            month=month,
            year=year,
            total_revenue=total_revenue,
            paid_invoices=paid_invoices,
            unpaid_invoices=unpaid_invoices,
            total_rooms=len(rooms),
            total_capacity=total_capacity,
            occupied_beds=occupied_beds,
            occupancy_rate=occupancy_rate,
            building_reports=building_reports,
        )