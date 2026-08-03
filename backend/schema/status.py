from enum import Enum

class ResponseStatus(str, Enum):
    SUCCESS = "success"
    FAIL = "fail"
    ERROR = "error"
    UNAUTHORIZED = "unauthorized"
    FORBIDDEN = "forbidden"
    CREATED ="created"