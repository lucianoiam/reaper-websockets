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

import { Component } from './base/component.js';
import MessageChannel from './base/channel.js';
import Mixer from './components/mixer.js';
import Transport from './components/transport.js';

function getOption (options, key, defaultValue) {
	return options ? (key in options ? options[key] : defaultValue) : defaultValue;
}

export default class ReaperClient extends Component {

	constructor (options) {
		super(new MessageChannel(
			getOption(options, 'hostname', location.hostname),
			getOption(options, 'port', 9001),
		));

		if (getOption(options, 'components', true)) {
			this._mixer = new Mixer(this.channel);
			this._transport = new Transport(this.channel);
			this._components = [this._mixer, this._transport];
		} else {
			this._components = [];
		}

		this._autoReconnect = getOption(options, 'autoReconnect', true);
		this._connected = false;

		this.channel.onMessage = (path, ...args) => this.handleOsc(path, ...args);
		this.channel.onError = (err) => this.notifyObservers('error', err);
	}

	// Access to the object-oriented API

	get mixer () {
		return this._mixer;
	}

	get transport () {
		return this._transport;
	}

	// Connection control

	async connect () {
		this.channel.onClose = async () => {
			if (this._connected) {
				this._setConnected(false);
			}

			if (this._autoReconnect) {
				await this._sleep(1000);
				await this._connect();
			}
		};

		await this._connect();
	}

	disconnect () {
		this.channel.onClose = () => {};
		this.channel.close();
		this._setConnected(false);
	}

	// Overriden Component methods

	handleOsc (path, ...args) {
		this.notifyObservers('message', path, ...args);

		for (const component of this._components) {
			if (component.handleOsc(path, ...args)) {
				break;
			}
		}
	}

	// Private methods
	
	async _sleep (t) {
		return new Promise((resolve) => setTimeout(resolve, t));
	}

	async _connect () {
		await this.channel.open();
		this._setConnected(true);
	}

	_setConnected (connected) {
		this._connected = connected;
		this.notify('connected');
	}

}
