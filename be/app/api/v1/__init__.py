from fastapi import APIRouter

from app.api.v1 import auth, buildings, invoices, maintenance, notifications, registrations

router = APIRouter(prefix="/v1")
router.include_router(auth.router)
router.include_router(buildings.router)
router.include_router(registrations.router)
router.include_router(invoices.router)
router.include_router(maintenance.router)
router.include_router(notifications.router)
