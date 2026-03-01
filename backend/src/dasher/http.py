"""Shared httpx client factory with request/response logging."""
import logging

import httpx

logger = logging.getLogger(__name__)


def _log_request(request: httpx.Request) -> None:
    logger.debug("→ %s %s", request.method, request.url)


def _log_response(response: httpx.Response) -> None:
    if response.is_error:
        logger.error("← %s %s", response.status_code, response.url)
    else:
        logger.debug("← %s %s", response.status_code, response.url)


def make_client(**kwargs) -> httpx.AsyncClient:
    """Return an AsyncClient with request/response logging pre-configured."""
    hooks: dict = {"request": [_log_request], "response": [_log_response]}
    return httpx.AsyncClient(event_hooks=hooks, **kwargs)


def log_response_error(exc: httpx.HTTPStatusError) -> None:
    """Log status-error response body. Call from an except httpx.HTTPStatusError block."""
    logger.error(
        "← %s %s\n%s",
        exc.response.status_code,
        exc.response.url,
        exc.response.text[:2000],
    )
