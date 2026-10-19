class XMLTransformationError(Exception):
    """Base exception for XML transformation failures."""


class UnmappedEventCodeError(XMLTransformationError):
    """Raised when an internal EventCategory cannot be mapped to a carrier code."""


class InvalidEventDateTimeError(XMLTransformationError):
    """Raised when event dateTime is missing or invalid."""


class InvalidEventCodeError(XMLTransformationError):
    """Raised when event code is missing or invalid."""


class InvalidReferenceError(XMLTransformationError):
    """Raised when event code is missing or invalid."""


class InvalidReferenceLengthError(XMLTransformationError):
    """Raised when event code is missing or invalid."""
