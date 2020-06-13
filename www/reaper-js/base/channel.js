/*
 * Copyright © 2020 Luciano Iam <lucianito@gmail.com>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import loadScript from './script.js';

export class MessageChannel {

	constructor (hostname, port, handlers) {
		this._hostname = hostname;
		this._port = port;
		this._pending = null;
	}

	async open () {
		// Load a library for reading and writing OSC messages
		await loadScript(import.meta, '../osc-js/osc.js');

		const handler = (msg) => {
			if (this._pending && (this._pending.path == msg.address)) {
				this._pending.resolve(msg.args);
				this._pending = null;
			} else {
				this.onMessage(msg.address, ...msg.args);
			}
		};

		return new Promise((resolve, reject) => {
			this._socket = new WebSocket(`ws://${this._hostname}:${this._port}`);

			this._socket.onopen = resolve;

			this._socket.onclose = () => this.onClose();

			this._socket.onerror = (error) => this.onError(error);

			this._socket.onmessage = (event) => {
				// https://stackoverflow.com/questions/15341912/how-to-go-from-blob-to-arraybuffer
				// event.data.arrayBuffer()
				new Response(event.data).arrayBuffer().then((arrayBuffer) => {
					const packet = new OSC.Packet()
					packet.unpack(new DataView(arrayBuffer));

					if (packet.value instanceof OSC.Message) {
						handler(packet.value);
					} else if (packet.value instanceof OSC.Bundle) {
						for (const msg of packet.value.bundleElements) {
							handler(msg);
						}
					}
				});
			};
		});
	}

	close () {
		this._socket.close();

		if (this._pending) {
			this._pending.reject(Error('MessageChannel: socket closed awaiting response'));
			this._pending = null;
		}
	}

	send (path, ...args) {
		if (this._socket) {
			const msg = new OSC.Message(path, ...args);
			this._socket.send(msg.pack());
		} else {
			this.onError(Error('MessageChannel: cannot call send() before open()'));
		}
	}

	async sendAndReceive (path, ...args) {
		return new Promise((resolve, reject) => {
			this._pending = {resolve: resolve, reject: reject, path: path};
			this.send(path, ...args);
		});
	}

	onMessage (path, ...args) {}
	onError (err) {}
	onClose () {}

}

