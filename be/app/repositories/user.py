from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: AsyncSession):
        super().__init__(User, db)

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_student_code(self, student_code: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.student_code == student_code))
        return result.scalar_one_or_none()

    async def email_exists(self, email: str) -> bool:
        result = await self.db.execute(select(User.id).where(User.email == email))
        return result.scalar_one_or_none() is not None

    async def student_code_exists(self, student_code: str) -> bool:
        result = await self.db.execute(select(User.id).where(User.student_code == student_code))
        return result.scalar_one_or_none() is not None
