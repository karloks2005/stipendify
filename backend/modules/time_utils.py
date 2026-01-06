from datetime import datetime, timezone

def to_utc_naive(dt: datetime) -> datetime:
    """
    Accepts:
      - naive datetime (assumed UTC)
      - tz-aware datetime (e.g. ...Z or +01:00)
    Returns:
      - naive UTC datetime (tzinfo=None), safe for TIMESTAMP WITHOUT TIME ZONE.
    """
    if dt.tzinfo is None:
        return dt
    return dt.astimezone(timezone.utc).replace(tzinfo=None)
