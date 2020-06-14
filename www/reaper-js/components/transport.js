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

export default class Transport extends Component {

	constructor (channel) {
		super(channel);
		this._playing = undefined;
		this._recording = undefined;
	}
	
	get playing () {
		return this._playing;
	}

	get recording () {
		return this._recording;
	}

	play () {
		this.sendOsc('/play')
	}

	record () {
		this.sendOsc('/record')
	}

	stop () {
		this.sendOsc('/stop')
	}

	gotToEnd () {
		// Transport: Go to end of project
		this.sendAction(40043)
	}

	armAllTracks () {
		// Track: Arm all tracks for recording
		this.sendAction(40490)
	}

	unarmAllTracks () {
		// Track: Unarm all tracks for recording
		this.sendAction(40491)
	}

	forwardOneMeasure () {
		// Move edit cursor forward one measure (no seek)
		this.sendAction(40839)
	}

	handleOsc (path, ...args) {
		switch (path) {
			case '/play':
				this.setProperty('playing', args[0] == 1.0);
				return true;
			case '/record':
				this.setProperty('recording', args[0] == 1.0);
				return true;
			default:
				break;
		}

		return false;
	}

}
