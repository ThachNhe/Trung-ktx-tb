from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies import AdminUser
from app.schemas.base_response import BaseResponse
from app.schemas.report import MonthlyReportResponse
from app.services.report import ReportService

router = APIRouter(prefix="/reports", tags=["Reports"])


def get_report_service(db: AsyncSession = Depends(get_db)) -> ReportService:
    return ReportService(db)


@router.get(
    "/monthly",
    response_model=BaseResponse[MonthlyReportResponse],
    summary="Lấy báo cáo tháng",
)
async def get_monthly_report(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000),
    # _current_user: AdminUser,
    service: ReportService = Depends(get_report_service),
):
    data = await service.get_monthly_report(month, year)
    return BaseResponse.ok(data=data, message="Lấy báo cáo tháng thành công")