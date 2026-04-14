from typing import Annotated

from fastapi import Depends, Query

from app.schemas.common import PaginationParams


def get_pagination_params(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
) -> PaginationParams:
    return PaginationParams(page=page, limit=limit)


PaginationQuery = Annotated[PaginationParams, Depends(get_pagination_params)]