const fs = require('fs');
const FormData = require('form-data');
const http = require('http');

const form = new FormData();
form.append('image', fs.createReadStream('test-appointment.png'));

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/v1/appointment/parse',
    method: 'POST',
    headers: form.getHeaders()
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response:');
        console.log(JSON.stringify(JSON.parse(data), null, 2));
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

form.pipe(req);
