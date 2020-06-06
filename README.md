# reaper-websockets

Python script for setting up a bidirectional bridge between REAPER's OSC control
surface and web-based client implementations.

#### Quick start

- REAPER → Preferences → Control/OSC/web → Add → OSC → Mode "Local port"
- Run `bridge.py`
- Open browser at http://localhost:9000 

#### Credits

- Python OSC message parser from https://github.com/attwad/python-osc (MIT License)
- JavaScript OSC client from https://github.com/adzialocha/osc-js (Unlicense)
