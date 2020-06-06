/*
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
*/

(() => {

    const osc = new OSC();

    /*osc.on('open', () => {
        const message = new OSC.Message('/play');
        osc.send(message)
    });*/

    osc.on('*', (message) => {
        const output = document.getElementById('output');
        const html = output.innerHTML;
        output.innerHTML = String(`${message.address} ${message.args}\n`) + html;
    });

    osc.open({ port: 9001 });

})();
