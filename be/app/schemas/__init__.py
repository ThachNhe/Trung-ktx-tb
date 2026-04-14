from app.schemas.auth import AuthResponse, LoginRequest, RefreshTokenRequest, RegisterRequest, TokenResponse, UserResponse
from app.schemas.base_response import BaseResponse, PaginatedResponse
from app.schemas.building_room import (
    BuildingResponse,
    CreateBuildingRequest,
    CreateRoomRequest,
    RoomResponse,
    UpdateRoomStatusRequest,
)
from app.schemas.common import (
    BuildingSummaryResponse,
    PaginatedData,
    PaginationMeta,
    PaginationParams,
    RoomSummaryResponse,
    UserSummaryResponse,
)
from app.schemas.invoice import CreateInvoiceRequest, InvoiceResponse
from app.schemas.maintenance import (
    CreateMaintenanceRequest,
    MaintenanceResponse,
    UpdateMaintenanceStatusRequest,
)
from app.schemas.notification import CreateNotificationRequest, NotificationResponse
from app.schemas.registration import CreateRegistrationRequest, RegistrationResponse

__all__ = [
    "BaseResponse",
    "PaginatedResponse",
    "PaginatedData",
    "PaginationMeta",
    "PaginationParams",
    "RegisterRequest",
    "LoginRequest",
    "RefreshTokenRequest",
    "UserResponse",
    "TokenResponse",
    "AuthResponse",
    "UserSummaryResponse",
    "RoomSummaryResponse",
    "BuildingSummaryResponse",
    "CreateBuildingRequest",
    "CreateRoomRequest",
    "UpdateRoomStatusRequest",
    "BuildingResponse",
    "RoomResponse",
    "CreateRegistrationRequest",
    "RegistrationResponse",
    "CreateInvoiceRequest",
    "InvoiceResponse",
    "CreateMaintenanceRequest",
    "UpdateMaintenanceStatusRequest",
    "MaintenanceResponse",
    "CreateNotificationRequest",
    "NotificationResponse",
]
