from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies import AdminOrStaffUser, CurrentUser, PaginationQuery
from app.schemas.base_response import BaseResponse
from app.schemas.common import PaginatedData
from app.schemas.invoice import CreateInvoiceRequest, InvoiceResponse
from app.services.invoice import InvoiceService

router = APIRouter(prefix="/invoices", tags=["Invoices"])


def get_invoice_service(db: AsyncSession = Depends(get_db)) -> InvoiceService:
    return InvoiceService(db)


@router.post(
    "",
    response_model=BaseResponse[InvoiceResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Tạo hóa đơn tháng",
)
async def create_invoice(
    payload: CreateInvoiceRequest,
    current_user: AdminOrStaffUser,
    service: InvoiceService = Depends(get_invoice_service),
):
    data = await service.create_invoice(payload)
    return BaseResponse.ok(data=data, message="Tạo hóa đơn thành công")


@router.get(
    "",
    response_model=BaseResponse[PaginatedData[InvoiceResponse]],
    summary="Lấy danh sách hóa đơn",
)
async def list_invoices(
    pagination: PaginationQuery,
    current_user: CurrentUser,
    service: InvoiceService = Depends(get_invoice_service),
):
    data = await service.list_invoices(current_user, pagination)
    return BaseResponse.ok(data=data, message="Lấy danh sách hóa đơn thành công")


@router.patch(
    "/{invoice_id}/pay",
    response_model=BaseResponse[InvoiceResponse],
    summary="Xác nhận thanh toán hóa đơn",
)
async def pay_invoice(
    invoice_id: int,
    current_user: AdminOrStaffUser,
    service: InvoiceService = Depends(get_invoice_service),
):
    data = await service.pay_invoice(invoice_id)
    return BaseResponse.ok(data=data, message="Xác nhận thanh toán thành công")