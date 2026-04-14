from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies import AdminOrStaffUser, CurrentUser, PaginationQuery, StudentUser
from app.schemas.base_response import BaseResponse
from app.schemas.common import PaginatedData
from app.schemas.registration import CreateRegistrationRequest, RegistrationResponse
from app.services.registration import RegistrationService

router = APIRouter(prefix="/registrations", tags=["Registrations"])


def get_registration_service(db: AsyncSession = Depends(get_db)) -> RegistrationService:
    return RegistrationService(db)


@router.post(
    "",
    response_model=BaseResponse[RegistrationResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Sinh viên đăng ký phòng",
)
async def create_registration(
    payload: CreateRegistrationRequest,
    current_user: StudentUser,
    service: RegistrationService = Depends(get_registration_service),
):
    data = await service.create_registration(current_user, payload)
    return BaseResponse.ok(data=data, message="Đăng ký phòng thành công")


@router.get(
    "",
    response_model=BaseResponse[PaginatedData[RegistrationResponse]],
    summary="Lấy danh sách đăng ký phòng",
)
async def list_registrations(
    pagination: PaginationQuery,
    current_user: CurrentUser,
    service: RegistrationService = Depends(get_registration_service),
):
    data = await service.list_registrations(current_user, pagination)
    return BaseResponse.ok(data=data, message="Lấy danh sách đăng ký phòng thành công")


@router.patch(
    "/{registration_id}/approve",
    response_model=BaseResponse[RegistrationResponse],
    summary="Duyệt đăng ký phòng",
)
async def approve_registration(
    registration_id: int,
    current_user: AdminOrStaffUser,
    service: RegistrationService = Depends(get_registration_service),
):
    data = await service.approve_registration(registration_id)
    return BaseResponse.ok(data=data, message="Duyệt đăng ký phòng thành công")


@router.patch(
    "/{registration_id}/reject",
    response_model=BaseResponse[RegistrationResponse],
    summary="Từ chối đăng ký phòng",
)
async def reject_registration(
    registration_id: int,
    current_user: AdminOrStaffUser,
    service: RegistrationService = Depends(get_registration_service),
):
    data = await service.reject_registration(registration_id)
    return BaseResponse.ok(data=data, message="Từ chối đăng ký phòng thành công")


@router.patch(
    "/{registration_id}/checkout",
    response_model=BaseResponse[RegistrationResponse],
    summary="Trả phòng",
)
async def checkout_registration(
    registration_id: int,
    current_user: AdminOrStaffUser,
    service: RegistrationService = Depends(get_registration_service),
):
    data = await service.checkout_registration(registration_id)
    return BaseResponse.ok(data=data, message="Trả phòng thành công")