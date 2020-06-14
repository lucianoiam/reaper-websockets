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

import { Observable } from './observable.js';

export class Component extends Observable {

	constructor (channel) {
		super(null);
		this._channel = channel;
	}

	get channel () {
		return this._channel;
	}

	on (event, callback) {
		this.addObserver(event, callback);
	}

	notify (property) {
		this.notifyObservers(property, this['_' + property]);
	}

	setProperty (property, value) {
		const key = '_' + property;
		if (this[key] === value) {
			return;
		}
		this[key] = value;
		this.notify(property);
	}

	sendAction (actionId) {
		this.channel.send('/action', actionId)
	}

	sendOsc (path, ...args) {
		this.channel.send(path, ...args)
	}

	handleOsc (path, ...args) {
		return false;
	}

}

export class ChildComponent extends Component {

	constructor (parent) {
		super();
		this._parent = parent;
	}

	get parent () {
		return this._parent;
	}

	get channel () {
		return this._parent.channel;
	}

}
