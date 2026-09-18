class XMLTransformationError(Exception):
    """Base exception for XML transformation failures."""

    pass


class UnmappedEventCodeError(XMLTransformationError):
    """Raised when an internal EventCategory cannot be mapped to a carrier code."""

    pass


class InvalidEventDateTimeError(XMLTransformationError):
    """Raised when event dateTime is missing or invalid."""

    pass


class InvalidEventCodeError(XMLTransformationError):
    """Raised when event code is missing or invalid."""

    pass


class InvalidReferenceError(XMLTransformationError):
    """Raised when event code is missing or invalid."""

    pass


class InvalidReferenceLengthError(XMLTransformationError):
    """Raised when event code is missing or invalid."""

    pass
