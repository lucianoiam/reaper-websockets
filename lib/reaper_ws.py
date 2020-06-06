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

from typing import Dict

from websockets.server import WebSocketServerProtocol

# https://github.com/attwad/python-osc - Unlicense
from pythonosc import osc_message_builder
from pythonosc import osc_packet

from .udp_ws import UdpWebsocketsBridge


"""
   ReaperOscWebsocketsBridge extends UdpWebsocketsBridge by keeping track of
   REAPER OSC control surface state and sending it to clients as they connect.
   This avoids the need for clients to call action 41743 on their own which
   would result in broadcasting thousands of feedback messages to all connected
   clients every time a new client connects.
"""

class ReaperOscWebsocketsBridge(UdpWebsocketsBridge):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self._state: Dict[str, bytes] = {}  # osc_path, osc_dgram

    async def start(self) -> None:
        await super().start()
        """query initial state by sending a special 'action' code to REAPER
           Control surface: refresh all surfaces"""
        msg = osc_message_builder.OscMessageBuilder(address='/action')
        msg.add_arg(41743)
        self.udp_send(msg.build().dgram)
    
    async def ws_handler(self, websocket: WebSocketServerProtocol, path: str) -> None:
        """send current state to new client"""
        for msg in self._state.values():
            await websocket.send(msg.dgram)
        await super().ws_handler(websocket, path)

    async def ws_broadcast(self, dgram: bytes) -> None:
        """broadcast is called when OSC packets arrive from REAPER"""
        for timed_msg in osc_packet.OscPacket(dgram).messages:
            self._state[timed_msg.message.address] = timed_msg.message
        await super().ws_broadcast(dgram)
