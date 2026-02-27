// Import the SerialPort module
import { SerialPort } from 'serialport';
import { SerialPortStream } from '@serialport/stream';
import { autoDetect } from '@serialport/bindings-cpp'
import { clargs, showPackageVersion, showArgs   } from "@toptensoftware/clargs";
import { fileURLToPath } from 'url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const binding = autoDetect();

// Async function to list all available serial ports
async function listSerialPorts()
{
    try
    {
        const ports = await SerialPort.list();

        if (ports.length === 0)
        {
            return;
        }

        ports.forEach((port, index) =>
        {
            //  console.log(`${index + 1}. ${port.path} - ${port.manufacturer || 'Unknown manufacturer'}`);
            console.log(`${port.path}\t${port.pnpId || ''}\t${port.manufacturer || ''}`)
        });
    } catch (err)
    {
        console.error('Error listing serial ports:', err);
    }
}

function createPort(path, options)
{
    options = {
        path,
        ...options
    }


    console.log(`Opening serial port:`, options);

    options.binding = binding;

    const port = new SerialPortStream(options)
    //const output = new OutputTranslator()
    //output.pipe(process.stdout)
    port.pipe(process.stdout)

    port.on('error', (err) =>
    {
        console.error('Error', err)
        process.exit(1)
    })

    port.on('close', (err) =>
    {
        console.log('Closed', err)
        process.exit(err ? 1 : 0)
    })

    process.stdin.setRawMode(true)
    process.stdin.on('data', input =>
    {
        for (const byte of input) 
        {
            // ctrl+c
            if (byte === 0x03) 
            {
                port.close()
                process.exit(0)
            }
        }
        port.write(input)
        if (options.echo) 
        {
          process.stdout.write(input)
        }
    })
    process.stdin.resume()

    process.stdin.on('end', () =>
    {
        port.close()
        process.exit(0)
    })
}

try
{
    let options = {
        baudRate: 115200,
        echo: false,
    };

    let args = clargs();
    let port = null;;
    while (args.next())
    {
        switch (args.name)
        {
            case "h":
            case "help":
                // -h or --help
                showHelp();
                process.exit(0);
                break;

            case "v":
            case "version":
                showVersion();
                process.exit(0);
                break;

            case "l":
            case "list":
                await listSerialPorts();
                process.exit(0);
                break;

            case "b":
            case "baud":
                options.baudRate = args.readIntValue();
                break;

            case "data-bits":
                options.dataBits = parseInt(args.readEnumValue("8|7|6|5"));
                break;

            case "stop-bits":
                options.stopBits = parseInt(args.readEnumValue("1|1.5|2"));
                break;

            case "parity":
                options.parity = args.readEnumValue("none|even|odd|mark|space");    
                break;

            case "echo":
                options.echo = args.readBoolValue();
                break;

            case null:
                // unnamed arg eg: file.txt
                if (port !== null)
                    throw new Error(`multiple ports specified`);
                port = args.readValue();
                break;

            default:
                throw new Error(`unknown arg: ${args.name}`);
        }
    }

    if (port === null)
        throw new Error(`no port specified`);

    createPort(port, options);
}
catch (err)
{
    console.error(err.message);
    process.exit(1);
}

function showHelp()
{
    showVersion();
    console.log("");
    console.log(`Usage: tsm [options] <port>`);
    console.log("");
    showArgs({
        "--help": "show this help message",
        "--version": "show version information",
        "--list": "list available serial ports",
        "--baud <number>": "set baud rate (default: 115200)",
        "--data-bits <number>": "set data bits 8|7|6|5 (default: 8)",
        "--stop-bits <number>": "set stop bits 1|1.5|2 (default: 1)",
        "--parity <type>": "set parity none|even|odd|mark|space (default: none)",
        "--echo <bool>": "echo input to output (default: false)",
    });
}

function showVersion()
{
    showPackageVersion(path.join(__dirname, "package.json"));
}