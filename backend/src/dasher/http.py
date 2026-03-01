"""Shared httpx client factory with request/response logging."""
import logging

import httpx

logger = logging.getLogger(__name__)


def _log_request(request: httpx.Request) -> None:
    logger.debug("→ %s %s", request.method, request.url)


async def _log_response(response: httpx.Response) -> None:
    if response.is_error:
        await response.aread()
        logger.error(
            "← %s %s\n%s",
            response.status_code,
            response.url,
            response.text[:2000],
        )
    else:
        logger.debug("← %s %s", response.status_code, response.url)


def make_client(**kwargs) -> httpx.AsyncClient:
    """Return an AsyncClient with request/response logging pre-configured."""
    hooks: dict = {"request": [_log_request], "response": [_log_response]}
    return httpx.AsyncClient(event_hooks=hooks, **kwargs)
