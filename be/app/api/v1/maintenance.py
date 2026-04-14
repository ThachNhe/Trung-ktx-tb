from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies import AdminOrStaffUser, CurrentUser, PaginationQuery, StudentUser
from app.schemas.base_response import BaseResponse
from app.schemas.common import PaginatedData
from app.schemas.maintenance import (
    CreateMaintenanceRequest,
    MaintenanceResponse,
    UpdateMaintenanceStatusRequest,
)
from app.services.maintenance import MaintenanceService

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


def get_maintenance_service(db: AsyncSession = Depends(get_db)) -> MaintenanceService:
    return MaintenanceService(db)


@router.post(
    "",
    response_model=BaseResponse[MaintenanceResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Tạo yêu cầu bảo trì",
)
async def create_maintenance_request(
    payload: CreateMaintenanceRequest,
    current_user: StudentUser,
    service: MaintenanceService = Depends(get_maintenance_service),
):
    data = await service.create_request(current_user, payload)
    return BaseResponse.ok(data=data, message="Tạo yêu cầu bảo trì thành công")


@router.get(
    "",
    response_model=BaseResponse[PaginatedData[MaintenanceResponse]],
    summary="Lấy danh sách yêu cầu bảo trì",
)
async def list_maintenance_requests(
    pagination: PaginationQuery,
    current_user: CurrentUser,
    service: MaintenanceService = Depends(get_maintenance_service),
):
    data = await service.list_requests(current_user, pagination)
    return BaseResponse.ok(data=data, message="Lấy danh sách yêu cầu bảo trì thành công")


@router.patch(
    "/{maintenance_id}/status",
    response_model=BaseResponse[MaintenanceResponse],
    summary="Cập nhật trạng thái bảo trì",
)
async def update_maintenance_status(
    maintenance_id: int,
    payload: UpdateMaintenanceStatusRequest,
    current_user: AdminOrStaffUser,
    service: MaintenanceService = Depends(get_maintenance_service),
):
    data = await service.update_status(maintenance_id, payload)
    return BaseResponse.ok(data=data, message="Cập nhật trạng thái bảo trì thành công")