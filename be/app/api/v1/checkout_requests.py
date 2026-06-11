from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies import CurrentUser, PaginationQuery, StudentUser
from app.schemas.base_response import BaseResponse
from app.schemas.checkout_request import CreateCheckoutRequest, CheckoutRequestResponse
from app.schemas.common import PaginatedData
from app.services.checkout_request import CheckoutRequestService

router = APIRouter(prefix="/checkout-requests", tags=["Checkout Requests"])


def get_checkout_request_service(db: AsyncSession = Depends(get_db)) -> CheckoutRequestService:
    return CheckoutRequestService(db)


@router.post(
    "",
    response_model=BaseResponse[CheckoutRequestResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Sinh viên tạo yêu cầu trả phòng",
)
async def create_checkout_request(
    payload: CreateCheckoutRequest,
    current_user: StudentUser,
    service: CheckoutRequestService = Depends(get_checkout_request_service),
):
    data = await service.create_request(current_user, payload)
    return BaseResponse.ok(data=data, message="Tạo yêu cầu trả phòng thành công")


@router.get(
    "",
    response_model=BaseResponse[PaginatedData[CheckoutRequestResponse]],
    summary="Lấy danh sách yêu cầu trả phòng",
)
async def list_checkout_requests(
    pagination: PaginationQuery,
    current_user: CurrentUser,
    service: CheckoutRequestService = Depends(get_checkout_request_service),
):
    data = await service.list_requests(current_user, pagination)
    return BaseResponse.ok(data=data, message="Lấy danh sách yêu cầu trả phòng thành công")
