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

import { Component } from '../base/component.js';

export class FxParameter extends Component {

	constructor (parent, n, name, value) {
		super(parent);
		this._n = n;
		this._name = name;
		this._value = undefined;
	}

	get fx () {
		return this.parent;
	}

	get n () {
		return this._n;
	}

	get name () {
		return this._name;
	}

	get value () {
		return this._value;
	}

	set value (value) {
		this._value = value;
		this._sendOsc(`/track/${this.fx.track.n}/fx/${this.fx.n}/fxparam/${this.n}/value`,
			this.value);
	}

	handleOsc (path, ...args) {
		const m = path.match(new RegExp('/track/\\d+/fx/\\d+/fxparam/\\d+/value'));

		if (m) {
			this.setProperty('value', args[0]);
			return true;
		}

		return false;
	}

}
