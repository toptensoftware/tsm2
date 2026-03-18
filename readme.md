# Tiny Telnet & Serial Monitor (ttsm)

A simple cross-platform serial and telnet terminal for Windows, Linux, and macOS.

## Installation

```bash
sudo npm install -g toptensoftware/tsm2
```

## Usage

Connect to a serial port:

```bash
ttsm /dev/ttyACM0           # Linux/macOS
ttsm COM3                   # Windows
```

Connect via telnet:

```bash
ttsm hostname               # default port 23
ttsm hostname:2323          # custom port
```

## Options

```
--baud <number>       set baud rate (default: 115200)
--data-bits <number>  set data bits 8|7|6|5 (default: 8)
--stop-bits <number>  set stop bits 1|1.5|2 (default: 1)
--parity <type>       set parity none|even|odd|mark|space (default: none)
--echo <bool>         echo input to output (default: false)
--list                list available serial ports
```

Use `ttsm --help` for more.

Press `Ctrl+C` to disconnect.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
