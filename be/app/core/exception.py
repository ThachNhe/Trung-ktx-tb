from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.constants.messages import ErrorMessage


class AppException(Exception):
    def __init__(self, status_code: int, message: str, error_code: str | None = None):
        self.status_code = status_code
        self.message = message
        self.error_code = error_code
        super().__init__(message)


class NotFoundException(AppException):
    def __init__(self, message: str = ErrorMessage.NOT_FOUND):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, message=message)


class UnauthorizedException(AppException):
    def __init__(self, message: str = ErrorMessage.UNAUTHORIZED):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, message=message)


class ForbiddenException(AppException):
    def __init__(self, message: str = ErrorMessage.FORBIDDEN):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, message=message)


class BadRequestException(AppException):
    def __init__(self, message: str = ErrorMessage.VALIDATION_ERROR):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, message=message)


class ConflictException(AppException):
    def __init__(self, message: str = ErrorMessage.VALIDATION_ERROR):
        super().__init__(status_code=status.HTTP_409_CONFLICT, message=message)


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.message, "error_code": exc.error_code},
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    errors = [
        {"field": ".".join(str(part) for part in item["loc"][1:]), "message": item["msg"]}
        for item in exc.errors()
    ]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"success": False, "message": ErrorMessage.VALIDATION_ERROR, "errors": errors},
    )


async def sqlalchemy_exception_handler(
    request: Request, exc: SQLAlchemyError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"success": False, "message": ErrorMessage.INTERNAL_ERROR},
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"success": False, "message": ErrorMessage.INTERNAL_ERROR},
    )
