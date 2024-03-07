var fs = require('fs');
var path = require('path');

// Function to create a file of a specific size in bytes
async function createFileOfSize(filename, sizeInBytes, random) {
    await createDirectories(filename);
    var writeStream = fs.createWriteStream(filename);
    var bytesWritten = 0;

    // Function to generate random data and write it to the stream
    function writeRandomData() {
        // Generate random byte values and write them to the stream
        while (bytesWritten < sizeInBytes) {
            var remainingBytes = sizeInBytes - bytesWritten;
            var chunkSize = Math.min(remainingBytes, 1024); // Adjust the chunk size as needed
            var buffer = Buffer.alloc(chunkSize);
            for (var i = 0; i < chunkSize; i++) {
                if (random === undefined || random === true) {
                    buffer[i] = Math.floor(Math.random() * 256); // Generate random byte value (0-255)
                } else {
                    buffer[i] = 0;
                }
            }
            writeStream.write(buffer);
            bytesWritten += chunkSize;
        }
        writeStream.end();
    }

    // Handle 'finish' event when writing is complete
    writeStream.on('finish', onFinish);

    // Handle any errors that occur during writing
    writeStream.on('error', onError);

    // Start writing random data to the stream
    writeRandomData();
}

function onFinish() {
    console.log('Buffer has been written to file');
}

function onError(err) {
    console.error('Error writing buffer to file:', err);
}

async function createDirectories(filePath) {
    const dirname = path.dirname(filePath); // Get the directory path
    await fs.promises.mkdir(dirname, { recursive: true }); // Create directories recursively
}

// Parse size from string with optional unit suffix (KB, MB, GB)
function parseSize(sizeString) {
    var sizeRegex = /^(\d+(?:\.\d+)?)([kmgb]?)$/i;
    var match = sizeString.match(sizeRegex);
    if (!match) {
        throw new Error(
            'Invalid size format. Please use format like 1, 1024B, 1.5K, 3M, 2G. If not units are provided bytes is assumed'
        );
    }

    var size = parseFloat(match[1]);
    var unit = match[2].toLowerCase();
    switch (unit) {
        case 'k':
            size *= 1024;
            break;
        case 'm':
            size *= 1024 * 1024;
            break;
        case 'g':
            size *= 1024 * 1024 * 1024;
            break;
    }
    return size;
}

// Extract filename and size from command line arguments
var args = process.argv.slice(2);
if (args.length !== 2) {
    console.error('Usage: node createFile.js <filename> <size>');
    process.exit(1);
}

var filename = args[0];
var sizeString = args[1];
var sizeInBytes = parseSize(sizeString);

// Check if size is a valid number
if (isNaN(sizeInBytes) || sizeInBytes < 0) {
    console.error(
        'Invalid size. Please provide a positive integer for size or use a valid unit (B, KB, MB, GB).'
    );
    process.exit(1);
}

createFileOfSize(filename, sizeInBytes, true);
console.log(
    "File '" + filename + "' created with size " + sizeInBytes + ' bytes.'
);
