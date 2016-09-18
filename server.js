const http = require('http');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
	var type;
	var url = req.url;
	
	if(url == '/')
		url = '/index.html';
	
	var ext = url.split('.').pop();

	switch(ext){
		case "html":
			type = "text/html";
			break;
		case "js":
			type = 'application/javascript';
			break;
		case 'json':
			type = 'application/json';
			break;
		case "png":
			type = 'image/png';
			break;
		case "jpg":
			type = 'image/jpg';
			break;
		case "wav":
			type = 'audio/wav';
			break;
		default:
			type: 'text/html';
	}
	try{
		res.statusCode = 200;
		res.setHeader('Content-Type', type);
		url = url.substring(1);
		var responseFileContent = fs.readFileSync(url);
		res.end(responseFileContent);
	}catch(e){
		res.statusCode = 404;
		res.end();
		console.log('Could not load ', url);
	}
});

server.listen(port, hostname, () => {
	console.log(`Ramzi\`s server is running at http://${hostname}:${port}/`);
	});