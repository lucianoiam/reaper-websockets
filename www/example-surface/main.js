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

import ReaperClient from '/reaper-js/client.js';

(() => {

	const dom = ['output', 'vol', 'apply'].reduce((dom, id) => {
		dom[id] = document.getElementById(id);
		return dom;
	}, {});

	function log (message) {
		dom.output.innerHTML += message + '\n';
        document.body.scrollTop = document.body.scrollHeight;
	}

	async function main() {
		const reaper = new ReaperClient();

		reaper.on('osc', (path, ...args) => console.log(`${path} ${args}`));
		reaper.on('connected', (connected) => log(`Connected: ${connected}`));
		reaper.on('error', (connected) => log(`Error: ${connected}`));
		
		reaper.transport.on('playing', (playing) => log(`Playing: ${playing}`));
		reaper.transport.on('recording', (recording) => log(`Recording: ${recording}`));

		reaper.mixer.on('ready', () => {
			for (const track of reaper.mixer.tracks) {
				log(`Track #${track.n} name=${track.name}`)

				track.on('volume', (value) => {
					log(`Volume ${value}`);
				});

				for (const fx of track.fx) {
					log(`  Fx #${fx.n} name=${fx.name}`);

					fx.on('bypass', (value) => {
						log(`Bypass ${value}`);
					});

					for (const param of fx.parameters) {
						log(`    Param #${param.n} val=${param.value}`);

						param.on('value', (value) => {
							log(`Parameter ${value}`);
						});
					}
				}
			}
		});

		await reaper.connect();

		dom.apply.addEventListener('click', (ev) => {
			reaper.mixer.getTrack(1).volume = parseFloat(dom.vol.value);
		});
	}

	main();

})();
