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

import { ChildComponent } from '../base/component.js';
import { Fx } from './fx.js';

export class Track extends ChildComponent {

	constructor (parent, n, name) {
		super(parent);
		this._n = n;
		this._name = name;
		this._volume = undefined;
		this._pan = undefined;
		this._mute = undefined;
		this._vu = undefined;
		this._fx = [];
	}

	get n () {
		return this._n;
	}

	get name () {
		return this._name;
	}

	get volume () {
		return this._volume;
	}

	set volume (value) {
		this._volume = value;
		this.sendOsc(`/track/${this.n}/volume/db`, this.volume);
	}

	get pan () {
		return this._pan;
	}

	set pan (value) {
		this._pan = value;
		this.sendOsc(`/track/${this.n}/pan`, this.pan);
	}

	get mute () {
		return this._mute;
	}

	set mute (value) {
		this._mute = value;
		this.sendOsc(`/track/${this.n}/mute`, this.mute ? 1.0 : 0.0);
	}

	get vu () {
		return this._vu;
	}

	get fx () {
		return this._fx;
	}

	hasFx (n) {
		return n <= this._fx.length;
	}

	getFx (n) {
		return this._fx[n - 1];
	}

	handleOsc (path, ...args) {
		let m = path.match(new RegExp('/track/\\d+/vu'));
		if (m) {
			this.setProperty('vu', args[0]);
			return true;
		}

		m = path.match(new RegExp('/track/\\d+/fx/(\\d+)/(.+)'));
		if (m) {
			const fxN = parseInt(m[1]);
			if (m[2] == 'name') {
				if (args[0]) {
					this._fx.push(new Fx(this, fxN, args[0] /* name */));
					this.notify('fx');
				}
			} else {
				if (this.hasFx(fxN)) {
					return this.getFx(fxN).handleOsc(path, ...args);
				}
			}
			return true;
		}

		m = path.match(new RegExp('/track/\\d+/(.+)'));
		if (m) {
			switch (m[1]) {
				case 'volume/db':
					this.setProperty('volume', args[0]);
					break;
				case 'pan':
					this.setProperty('pan', args[0]);
					break;
				case 'mute':
					this.setProperty('mute', args[0] != 0.0);
					break;
				default:
					break;
			}
			return true;
		}

		return false;
	}

}
