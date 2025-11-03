from typing import Optional

from fastapi import Response, status
from fastapi.responses import RedirectResponse
from fastapi_users.authentication import CookieTransport


class RedirectCookieTransport(CookieTransport):
    def __init__(
        self,
        login_redirect_url: str = "/",
        logout_redirect_url: str = "/",
        *,
        cookie_name: str = "session",
        cookie_max_age: Optional[int] = None,
        cookie_path: str = "/",
        cookie_domain: Optional[str] = None,
        cookie_secure: bool = True,
        cookie_httponly: bool = True,
        cookie_samesite: str = "lax",
    ) -> None:
        super().__init__(
            cookie_name=cookie_name,
            cookie_max_age=cookie_max_age,
            cookie_path=cookie_path,
            cookie_domain=cookie_domain,
            cookie_secure=cookie_secure,
            cookie_httponly=cookie_httponly,
            cookie_samesite=cookie_samesite,
        )
        self.login_redirect_url = login_redirect_url
        self.logout_redirect_url = logout_redirect_url

    async def get_login_response(self, token: str) -> Response:
        response = RedirectResponse(
            url=self.login_redirect_url,
            status_code=status.HTTP_303_SEE_OTHER,
        )
        self._set_login_cookie(response, token)
        return response

    async def get_logout_response(self) -> Response:
        response = RedirectResponse(
            url=self.logout_redirect_url,
            status_code=status.HTTP_303_SEE_OTHER,
        )
        self._set_logout_cookie(response)
        return response

    async def get_authenticate_response(self, token: str) -> Response:
        """
        Used when a backend wants to refresh/rotate the token.
        You can choose where that should redirect; usually same as login.
        """
        response = RedirectResponse(
            url=self.login_redirect_url,
            status_code=status.HTTP_303_SEE_OTHER,
        )
        self._set_login_cookie(response, token)
        return response
