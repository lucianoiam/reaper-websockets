# reaper-websockets

Python script for setting up a bidirectional bridge between REAPER's OSC control
surface and web-based client implementations.

Includes a JavaScript port of https://github.com/lucianoiam/pyreaosc for
interacting with the REAPER mixer through an easy to use object-oriented API.

#### Quick start

- REAPER → Preferences → Control/OSC/web → Add → OSC → Mode "Local port"
- Run `bridge.py`
- Open browser at http://localhost:9000

#### Client usage example

```
const reaper = new ReaperClient();

reaper.transport.on('playing', (playing) => console.log(`Playing: ${playing}`));
reaper.transport.on('recording', (recording) => console.log(`Recording: ${recording}`));

reaper.mixer.on('ready', () => {

	reaper.mixer.getTrack(1).volume = -12;	// dB
	
	for (const track of reaper.mixer.tracks) {
		console.log(`Track #${track.n} name=${track.name}`)

		track.on('volume', (value) => {
			console.log(`Volume ${value}`);
		});

		for (const fx of track.fx) {
			console.log(`  Fx #${fx.n} name=${fx.name}`);

			fx.on('bypass', (value) => {
				console.log(`Bypass ${value}`);
			});

			for (const param of fx.parameters) {
				console.log(`    Param #${param.n} val=${param.value}`);

				param.on('value', (value) => {
					console.log(`Parameter ${value}`);
				});
			}
		}
	}
});

await reaper.connect();
```

#### Credits

- OSC parser from https://github.com/attwad/python-osc (MIT License)
- OSC parser from https://github.com/adzialocha/osc-js (Unlicense)
