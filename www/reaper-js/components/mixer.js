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
import Track from './track.js';

export default class Mixer extends Component {

	constructor (channel) {
		super(channel);
		this._ready = false;
		this._tracks = [];
	}

	get tracks () {
		return this._tracks;
	}

	hasTrack (n) {
		return n <= this._tracks.length;
	}

	getTrack (n) {
		return this._tracks[n - 1];
	}
	  
	handleOsc (path, ...args) {
		if (!this._ready && path.startsWith('/lastregion')) {
			/* if not this._ready and path.startswith('/lastregion'):
			   assume last message triggered by action 41743 is /lastregion */
		  	this.setProperty('ready', true);
		  	return false;
		}

		const m = path.match(new RegExp('/track/(\\d+)/(.+)'));

		if (m) {
			const trackN = parseInt(m[1]);
			if (m[2] == 'name') {
				// create track
				if (m[0]) {
					this._tracks.push(new Track(this, trackN, args[0] /* name */));
					this.notify('tracks')
					return true;
				}
			} else {
				// delegate message to existing track
				if (this.hasTrack(trackN)) {
					return this.getTrack(trackN).handleOsc(path, ...args);
				}
			}
		}

		return false;
	}

}
