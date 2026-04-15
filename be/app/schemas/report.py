from decimal import Decimal

from pydantic import BaseModel

from app.constants.enums import BuildingCode


class MonthlyBuildingReportResponse(BaseModel):
    building_id: int
    building_name: BuildingCode
    total_rooms: int
    total_capacity: int
    occupied_beds: int
    occupancy_rate: int


class MonthlyReportResponse(BaseModel):
    month: int
    year: int
    total_revenue: Decimal
    paid_invoices: int
    unpaid_invoices: int
    total_rooms: int
    total_capacity: int
    occupied_beds: int
    occupancy_rate: int
    building_reports: list[MonthlyBuildingReportResponse]