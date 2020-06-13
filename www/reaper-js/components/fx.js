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
import { FxParameter } from './fxparam.js';

export class Fx extends Component {

	constructor (parent, n, name) {
		super(parent);
		this._n = n;
		this._name = name;
		this._bypass = undefined;
		this._parameters = [];
	}

	get track () {
		return this.parent;
	}

	get n () {
		return this._n;
	}

	get name () {
		return this._name;
	}

	get bypass () {
		return this._bypass;
	}

	set bypass (value) {
		this._bypass = value;
		this.sendOsc(`/track/${this.track.n}/fx/${this.n}/bypass`,
			this.bypass ? 1.0 : 0.0);
	}

	get parameters () {
		return this._parameters;
	}

	hasParameter (n) {
		return n <= this._parameters.length;
	}

	getParameter (n) {
		return this._parameters[n - 1];
	}

	handleOsc (path, ...args) {
		let m = path.match(new RegExp('/track/\\d+/fx/\\d+/bypass'));
		if (m) {
			// seems to be reversed
			this.setProperty('bypass', args[0] == 0);
			return true;
		}

		/* server does not report name for fxparams in tracks
		   hence there is no way to determine if a param exists at all
		   create a new param when a /value message is received
		 */

		m = path.match(new RegExp('/track/\\d+/fx/\\d+/fxparam/(\\d+)/value'));
		if (m) {
			const paramN = parseInt(m[1]);
			if (this.hasParameter(paramN)) {
				return this.getParameter(paramN).handleOsc(path, ...args);
			} else {
				const param = new FxParameter(this, paramN, null /* name */, args[0] /* value */);
				this._parameters.push(param);
				this.notify('parameters');
				return true;
			}
		}

		return false;
	}

}
