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

import asyncio
import websockets

from websockets.server import WebSocketServerProtocol

from typing import Coroutine, Set, Tuple


"""
   A transparent UDP <-> WebSockets bridge that routes raw datagrams
"""

Address=Tuple[str, int]


class _UdpClientProtocol:
    def __init__(self, recv_callback: Coroutine) -> None:
        self._recv_callback = recv_callback

    def connection_made(self, transport) -> None:
        pass

    def datagram_received(self, data: bytes, addr: Address) -> None:
        """https://stackoverflow.com/questions/48621360/does-asyncio-from-python
            -support-coroutine-based-api-for-udp-networking"""
        asyncio.get_event_loop().create_task(self._recv_callback(data))

    def error_received(self, exc) -> None:
        print('UDP error received:', exc)


class UdpWebsocketsBridge:

    def __init__(self, udp_addr: Address, ws_addr: Address) -> None:
        self._udp_addr = udp_addr
        self._ws_addr = ws_addr
        self._ws_clients: Set[WebSocketServerProtocol] = set()
        self._udp_transport: asyncio.Transport = None

    async def start(self) -> None:
        loop = asyncio.get_event_loop()
        self._udp_transport, _ = await loop.create_datagram_endpoint(
            lambda: _UdpClientProtocol(self.ws_broadcast),
            remote_addr=self._udp_addr)
        await websockets.serve(self.ws_handler, self._ws_addr[0], self._ws_addr[1])

    def udp_send(self, dgram: bytes) -> None:
        """websocket → udp"""
        self._udp_transport.sendto(dgram)

    async def ws_handler(self, websocket: WebSocketServerProtocol, path: str) -> None:
        """called once for every client that connects"""
        self._ws_clients.add(websocket)
        try:
            async for message in websocket:
                self.udp_send(message)
        except Exception as e:
            print('WS handler:', e)
        finally:
            self._ws_clients.remove(websocket)
    
    async def ws_broadcast(self, dgram: bytes) -> None:
        """udp → websocket"""
        for websocket in self._ws_clients:
            await websocket.send(dgram)
