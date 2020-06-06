"""
    Copyright © 2020 Luciano Iam <lucianito@gmail.com>

    This library is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this library.  If not, see <https://www.gnu.org/licenses/>.
"""

import argparse
import os

from http.server import SimpleHTTPRequestHandler


class HTTPRequestHandler(SimpleHTTPRequestHandler):
    
    shared_args: argparse.Namespace = None

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, directory=HTTPRequestHandler.shared_args.http_root, **kwargs)

    def end_headers(self) -> None:
        if HTTPRequestHandler.shared_args.http_cache.lower() != 'yes':
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format: str, *args) -> None:
        """supress output messages"""
        pass
