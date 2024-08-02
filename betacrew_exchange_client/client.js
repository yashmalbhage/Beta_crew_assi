const net = require('net');
const fs = require('fs');

const HOST = '127.0.0.1';
const PORT = 3000;

const callTypes = {
    STREAM_ALL_PACKETS: 1,
    RESEND_PACKET: 2,
};

let receivedPackets = [];
let receivedSequences = new Set();

const client = new net.Socket();
client.connect(PORT, HOST, () => {
    console.log('Connected to BetaCrew Exchange Server');

    const buffer = Buffer.alloc(2);
    buffer.writeUInt8(callTypes.STREAM_ALL_PACKETS, 0);
    buffer.writeUInt8(0, 1);
    client.write(buffer);
});

client.on('data', (data) => {
    for (let i = 0; i < data.length; i += 17) {
        const symbol = data.toString('ascii', i, i + 4).trim();
        const buySellIndicator = data.toString('ascii', i + 4, i + 5);
        const quantity = data.readInt32BE(i + 5);
        const price = data.readInt32BE(i + 9);
        const packetSequence = data.readInt32BE(i + 13);

        const packet = {
            symbol,
            buySellIndicator,
            quantity,
            price,
            packetSequence,
        };

        receivedPackets.push(packet);
        receivedSequences.add(packetSequence);
    }
});

client.on('close', async() => {
    console.log('Connection closed');

    // Check for missing sequences
    const missingSequences = [];
    const maxSequence = Math.max(...receivedPackets.map(p => p.packetSequence));
    for (let seq = 1; seq <= maxSequence; seq++) {
        if (!receivedSequences.has(seq)) {
            missingSequences.push(seq);
        }
    }

    for (const seq of missingSequences) {
        await requestMissingPacket(seq);
    }

    receivedPackets.sort((a, b) => a.packetSequence - b.packetSequence);

    fs.writeFileSync('output.json', JSON.stringify(receivedPackets, null, 2));

    console.log('All data saved to output.json');
});

function requestMissingPacket(sequence) {
    return new Promise((resolve) => {
        const buffer = Buffer.alloc(2);
        buffer.writeUInt8(callTypes.RESEND_PACKET, 0);
        buffer.writeUInt8(sequence, 1);

        const client = new net.Socket();
        client.connect(PORT, HOST, () => {
            client.write(buffer);
        });

        client.on('data', (data) => {
            const symbol = data.toString('ascii', 0, 4).trim();
            const buySellIndicator = data.toString('ascii', 4, 5);
            const quantity = data.readInt32BE(5);
            const price = data.readInt32BE(9);
            const packetSequence = data.readInt32BE(13);

            const packet = {
                symbol,
                buySellIndicator,
                quantity,
                price,
                packetSequence,
            };

            receivedPackets.push(packet);
            receivedSequences.add(packetSequence);

            client.destroy();
            resolve();
        });
    });
}

client.on('error', (err) => {
    console.error(`Error: ${err.message}`);
});