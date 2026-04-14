from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    STAFF = "staff"
    STUDENT = "student"


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class BuildingCode(str, Enum):
    K1 = "K1"
    K2 = "K2"
    K3 = "K3"
    K4 = "K4"
    K5 = "K5"
    K6 = "K6"
    K7 = "K7"
    K8 = "K8"


class BuildingStatus(str, Enum):
    ACTIVE = "active"
    MAINTENANCE = "maintenance"


class RoomType(str, Enum):
    MALE = "male"
    FEMALE = "female"
    LAOS_STUDENT = "laos_student"


class RoomStatus(str, Enum):
    AVAILABLE = "available"
    FULL = "full"
    MAINTENANCE = "maintenance"


class RoomRegistrationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CHECKED_OUT = "checked_out"


class InvoiceStatus(str, Enum):
    UNPAID = "unpaid"
    PAID = "paid"


class MaintenanceRequestStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"


class NotificationTargetRole(str, Enum):
    ALL = "all"
    STUDENT = "student"
    STAFF = "staff"


class TokenType(str, Enum):
    ACCESS = "access"
    REFRESH = "refresh"
