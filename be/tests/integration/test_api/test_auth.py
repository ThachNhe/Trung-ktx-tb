import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


class TestRegister:
    async def test_register_success(self, client: AsyncClient):
        res = await client.post(
            "/auth/register",
            json={
                "full_name": "New User",
                "student_code": "SVNEW01",
                "email": "new@example.com",
                "password": "Pass@1234",
                "phone": "0900000002",
                "gender": "male",
            },
        )
        assert res.status_code == 201
        body = res.json()
        assert body["success"] is True
        assert body["data"]["user"]["email"] == "new@example.com"

    async def test_register_duplicate_email(self, client: AsyncClient, registered_user: dict):
        res = await client.post("/auth/register", json=registered_user)
        assert res.status_code == 409

    async def test_register_invalid_email(self, client: AsyncClient):
        res = await client.post(
            "/auth/register",
            json={"full_name": "A", "student_code": "SV01", "email": "not-an-email", "password": "Pass@1234", "gender": "male"},
        )
        assert res.status_code == 422

    async def test_register_short_password(self, client: AsyncClient):
        res = await client.post(
            "/auth/register",
            json={"full_name": "User Short", "student_code": "SVSHORT", "email": "short@example.com", "password": "123", "gender": "male"},
        )
        assert res.status_code == 422


class TestLogin:
    async def test_login_success(self, client: AsyncClient, registered_user: dict):
        res = await client.post(
            "/auth/login",
            json={"email": registered_user["email"], "password": registered_user["password"]},
        )
        assert res.status_code == 200
        body = res.json()
        assert "access_token" in body["data"]["tokens"]
        assert "refresh_token" in body["data"]["tokens"]

    async def test_login_wrong_password(self, client: AsyncClient, registered_user: dict):
        res = await client.post(
            "/auth/login",
            json={"email": registered_user["email"], "password": "wrong_password"},
        )
        assert res.status_code == 401

    async def test_login_wrong_email(self, client: AsyncClient):
        res = await client.post(
            "/auth/login",
            json={"email": "ghost@example.com", "password": "Pass@1234"},
        )
        assert res.status_code == 401


class TestMe:
    async def test_get_me_success(self, client: AsyncClient, registered_user: dict):
        await client.post(
            "/auth/login",
            json={"email": registered_user["email"], "password": registered_user["password"]},
        )
        res = await client.get("/auth/me")
        assert res.status_code == 200
        assert res.json()["data"]["email"] == registered_user["email"]

    async def test_get_me_unauthorized(self, client: AsyncClient):
        res = await client.get("/auth/me")
        assert res.status_code == 401

    async def test_get_me_invalid_token(self, client: AsyncClient):
        res = await client.get(
            "/auth/me", headers={"Authorization": "Bearer invalid.token.here"}
        )
        assert res.status_code == 401


class TestRefreshToken:
    async def test_refresh_success(self, client: AsyncClient, registered_user: dict):
        await client.post(
            "/auth/login",
            json={"email": registered_user["email"], "password": registered_user["password"]},
        )
        res = await client.post("/auth/refresh")
        assert res.status_code == 200
        assert "access_token" in res.json()["data"]

    async def test_refresh_invalid_token(self, client: AsyncClient):
        res = await client.post(
            "/auth/refresh", json={"refresh_token": "invalid.token"}
        )
        assert res.status_code == 401
