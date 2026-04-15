class ErrorMessage:
    # Auth
    INVALID_CREDENTIALS = "Email hoặc mật khẩu không đúng"
    EMAIL_ALREADY_EXISTS = "Email đã được sử dụng"
    STUDENT_CODE_ALREADY_EXISTS = "Mã sinh viên đã được sử dụng"
    USER_NOT_FOUND = "Không tìm thấy người dùng"
    TOKEN_EXPIRED = "Token đã hết hạn"
    TOKEN_INVALID = "Token không hợp lệ"
    UNAUTHORIZED = "Bạn không có quyền truy cập"
    FORBIDDEN = "Bạn không có quyền thực hiện hành động này"

    # General
    NOT_FOUND = "Không tìm thấy dữ liệu"
    INTERNAL_ERROR = "Lỗi hệ thống, vui lòng thử lại sau"
    VALIDATION_ERROR = "Dữ liệu không hợp lệ"
    ROOM_FULL = "Phòng đã đầy, không thể đăng ký"
    STUDENT_ALREADY_HAS_ROOM = "Sinh viên đã có phòng hoặc đơn đăng ký đang chờ xử lý"
    ROOM_NOT_MATCH_STUDENT = "Phòng không phù hợp với giới tính hoặc quốc tịch của sinh viên"


class SuccessMessage:
    REGISTER_SUCCESS = "Đăng ký thành công"
    LOGIN_SUCCESS = "Đăng nhập thành công"
    LOGOUT_SUCCESS = "Đăng xuất thành công"
    TOKEN_REFRESHED = "Làm mới token thành công"
    PROFILE_LOADED = "Lấy thông tin người dùng thành công"
