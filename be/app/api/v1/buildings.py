from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies import AdminOrStaffUser, AdminUser, CurrentUser, PaginationQuery
from app.schemas.base_response import BaseResponse
from app.schemas.building_room import (
    BuildingResponse,
    CreateBuildingRequest,
    CreateRoomRequest,
    RoomResponse,
    UpdateRoomStatusRequest,
)
from app.schemas.common import PaginatedData
from app.services.building_room import BuildingRoomService

router = APIRouter(tags=["Buildings & Rooms"])


def get_building_room_service(
    db: AsyncSession = Depends(get_db),
) -> BuildingRoomService:
    return BuildingRoomService(db)


@router.get(
    "/buildings",
    response_model=BaseResponse[PaginatedData[BuildingResponse]],
    summary="Lấy danh sách tòa nhà",
)
async def list_buildings(
    pagination: PaginationQuery,
    current_user: CurrentUser,
    service: BuildingRoomService = Depends(get_building_room_service),
):
    data = await service.list_buildings(pagination)
    return BaseResponse.ok(data=data, message="Lấy danh sách tòa nhà thành công")


@router.get(
    "/buildings/{building_id}/rooms",
    response_model=BaseResponse[PaginatedData[RoomResponse]],
    summary="Lấy danh sách phòng theo tòa nhà",
)
async def list_building_rooms(
    building_id: int,
    pagination: PaginationQuery,
    current_user: CurrentUser,
    service: BuildingRoomService = Depends(get_building_room_service),
):
    data = await service.list_rooms_by_building(building_id, pagination)
    return BaseResponse.ok(data=data, message="Lấy danh sách phòng thành công")


@router.post(
    "/buildings",
    response_model=BaseResponse[BuildingResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Tạo tòa nhà",
)
async def create_building(
    payload: CreateBuildingRequest,
    current_user: AdminUser,
    service: BuildingRoomService = Depends(get_building_room_service),
):
    data = await service.create_building(payload)
    return BaseResponse.ok(data=data, message="Tạo tòa nhà thành công")


@router.post(
    "/rooms",
    response_model=BaseResponse[RoomResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Tạo phòng",
)
async def create_room(
    payload: CreateRoomRequest,
    current_user: AdminUser,
    service: BuildingRoomService = Depends(get_building_room_service),
):
    data = await service.create_room(payload)
    return BaseResponse.ok(data=data, message="Tạo phòng thành công")


@router.patch(
    "/rooms/{room_id}",
    response_model=BaseResponse[RoomResponse],
    summary="Cập nhật trạng thái phòng",
)
async def update_room_status(
    room_id: int,
    payload: UpdateRoomStatusRequest,
    current_user: AdminOrStaffUser,
    service: BuildingRoomService = Depends(get_building_room_service),
):
    data = await service.update_room_status(room_id, payload)
    return BaseResponse.ok(data=data, message="Cập nhật trạng thái phòng thành công")