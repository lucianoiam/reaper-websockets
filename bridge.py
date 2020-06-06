#!/usr/bin/env python3
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
import asyncio
import signal
import socketserver

from threading import Thread

from lib.httpd import HTTPRequestHandler
from lib.reaper_ws import ReaperOscWebsocketsBridge


async def run_bridge_until_sigint(args: argparse.Namespace) -> None:
    loop = asyncio.get_event_loop()
    on_sigint = loop.create_future()
    loop.add_signal_handler(signal.SIGINT, lambda: on_sigint.set_result(True))
    bridge = ReaperOscWebsocketsBridge(udp_addr=(args.reaper_address, args.reaper_port),
        ws_addr=(args.bind_address, args.websockets_port))
    await bridge.start()
    await on_sigint

def run_http_server(args: argparse.Namespace) -> None:
    HTTPRequestHandler.shared_args = args
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer((args.bind_address, args.http_port), HTTPRequestHandler) as httpd:
        httpd.serve_forever()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='REAPER OSC <-> WebSockets bidirectional bridge.',
        formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument('-ra', '--reaper-address', help='REAPER OSC address',
        type=str, default='127.0.0.1')
    parser.add_argument('-rp', '--reaper-port', help='REAPER OSC port',
        type=int, default=8000)
    parser.add_argument('-ba', '--bind-address', help='bind address for WebSockets and HTTP',
        type=str, default='127.0.0.1')
    parser.add_argument('-wp', '--websockets-port', help='WebSockets port',
        type=int, default=9001)
    parser.add_argument('-hs', '--http-server', help='enable HTTP server for static files',
        type=str, default='yes')
    parser.add_argument('-hp', '--http-port', help='HTTP server port',
        type=int, default=9000)
    parser.add_argument('-hr', '--http-root', help='path to static files',
        type=str, default='./example-client')
    parser.add_argument('-hc', '--http-cache', help='enable cache headers',
        type=str, default='yes')
    args = parser.parse_args()

    print(f'Bridging OSC port {args.reaper_port} <-> WebSockets port {args.websockets_port}')

    if args.http_server.lower() == 'yes':
        print(f'HTTP server available at http://{args.bind_address}:{args.http_port}')
        Thread(target=run_http_server, args=(args,), daemon=True).start()
    
    print('Hit Ctrl+C to stop')

    asyncio.run(run_bridge_until_sigint(args))
