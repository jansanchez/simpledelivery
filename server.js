var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
var exec = require("child_process").exec;

var args = [];

var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1;

if(dd<10) {
  dd='0'+dd
} 

if(mm<10) {
    mm='0'+mm
}


var resetArgs = function resetArgs(){
  args = ['curl', '--no-buffer', '--show-error', '--silent'];
}

//var restaurant = { name: 'Refugio Maleño Maleño', email: 'refugiomaleno1@gmail.com' };
var restaurant = { name: 'Jan Sanchez', email: 'joejansanchez@gmail.com' };

var options = {};

options.email = {
  general: {
    key: 'api:key-bfc71afead753d73cef11c5485c1fd2b',
    url: 'https://api.mailgun.net/v2/sandbox4a0fe54c0059454483eff6624145da45.mailgun.org/messages'
  }
};

options.email.defaults = {
  user: options.email.general.key,
  url: options.email.general.url
};

resetArgs();

app.listen(8000);

function handler (req, res) {
  
  var defaults = 'index.html';
  if(req.url !== '/'){
    defaults = req.url;
  };

  fs.readFile(__dirname + '/' + defaults, function (err, data) {
    var contentType = 'html';
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    if(req.url.indexOf('.js')!==-1){
      contentType = 'javascript';
    }
    if(req.url.indexOf('.css')!==-1){
      contentType = 'css';
    }
    
    res.writeHead(200, {'Content-Type': 'text/' + contentType});
    res.end(data, 'utf-8');
  });
}

io.on('connection', function (socket) {
  
  socket.emit('visit', {
    count: io.engine.clientsCount
  });

  socket.on('send', function (data) {
    args.push(`--url ${options.email.general.url} --user ${options.email.general.key}`);
    args.push(`--form from='${data.name} <${data.email}>'`);
    args.push(`--form to='${restaurant.name} <${restaurant.email}>'`);
    args.push(`--form bcc='${data.name} <${data.email}>'`);
    args.push(`--form subject='Pedido de menú para ${data.name} - El Comercio - ${dd}/${mm}'`);
    args.push(`--form-string html='<p>Buenas, escribo para realizar el siguiente pedido:<br><br><b>Entrada:</b> ${data.entrada}<br><b>Segundo:</b> ${data.segundo}<br><br>${data.mensaje}<br><br>Muchas gracias<br></p>'`);

    exec(args.join(" "), function (error, stdout, stderr) {
      message = '';
      if (error) {
        message = error;
      }else{
        message = JSON.parse(stdout).message;
        socket.emit('finish', {
          message: message
        });
      }
      console.log(message);
      resetArgs();
      return true;
    });
  });
});

