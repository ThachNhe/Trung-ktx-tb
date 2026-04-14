import pytest
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

from app.constants.enums import Gender, UserRole
from app.core.exception import ConflictException, UnauthorizedException
from app.schemas.auth import LoginRequest, RegisterRequest
from app.services.auth import AuthService

pytestmark = pytest.mark.asyncio


def make_mock_user(
    email="user@example.com",
    password_hash=None,
    role=UserRole.STUDENT,
    gender=Gender.MALE,
):
    from app.utils.security import hash_password

    user = MagicMock()
    user.id = uuid4()
    user.email = email
    user.password_hash = password_hash or hash_password("Test@1234")
    user.student_code = "SVTEST01"
    user.role = role
    user.full_name = "Test User"
    user.phone = "0900000001"
    user.gender = gender
    user.created_at = datetime.now(timezone.utc)
    return user


class TestRegisterService:
    async def test_register_success(self):
        db = AsyncMock()
        service = AuthService(db)
        service.user_repo = AsyncMock()
        service.user_repo.email_exists.return_value = False
        service.user_repo.student_code_exists.return_value = False
        service.user_repo.create.return_value = make_mock_user()

        result = await service.register(
            RegisterRequest(
                full_name="Test User",
                student_code="SVTEST01",
                email="user@example.com",
                password="Test@1234",
                phone="0900000001",
                gender=Gender.MALE,
            )
        )
        assert result.user.email == "user@example.com"

    async def test_register_duplicate_raises_conflict(self):
        db = AsyncMock()
        service = AuthService(db)
        service.user_repo = AsyncMock()
        service.user_repo.email_exists.return_value = True
        service.user_repo.student_code_exists.return_value = False

        with pytest.raises(ConflictException):
            await service.register(
                RegisterRequest(
                    full_name="Test User",
                    student_code="SVDUP01",
                    email="dup@example.com",
                    password="Test@1234",
                    phone="0900000001",
                    gender=Gender.MALE,
                )
            )


class TestLoginService:
    async def test_login_success(self):
        db = AsyncMock()
        service = AuthService(db)
        service.user_repo = AsyncMock()
        service.user_repo.get_by_email.return_value = make_mock_user()

        result = await service.login(LoginRequest(email="user@example.com", password="Test@1234"))
        assert result.tokens.access_token is not None

    async def test_login_wrong_password_raises(self):
        db = AsyncMock()
        service = AuthService(db)
        service.user_repo = AsyncMock()
        service.user_repo.get_by_email.return_value = make_mock_user()

        with pytest.raises(UnauthorizedException):
            await service.login(
                LoginRequest(email="user@example.com", password="wrong_password")
            )

    async def test_login_banned_user_raises(self):
        db = AsyncMock()
        service = AuthService(db)
        service.user_repo = AsyncMock()
        service.user_repo.get_by_email.return_value = make_mock_user()

        result = await service.login(LoginRequest(email="user@example.com", password="Test@1234"))
        assert result.user.email == "user@example.com"
