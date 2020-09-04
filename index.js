const crypto  = require( 'crypto' );
const btoa = require('btoa');
const atob = require('atob');

var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

function hexToBase64(str) {
    return btoa(String.fromCharCode.apply(null,
      str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
    );
}

// Base64 to Hex
function base64ToHex(str) {
    for (var i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")), hex = []; i < bin.length; ++i) {
        let tmp = bin.charCodeAt(i).toString(16);
        if (tmp.length === 1) tmp = "0" + tmp;
        hex[hex.length] = tmp;
    }
    return hex.join(" ");
}


function encrypt(text) {
 let cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(text.key), text.iv);
 let encrypted = cipher.update(text.text);
 encrypted = Buffer.concat([encrypted, cipher.final()]);
 return {key: text.key, iv: text.iv, encryptedData: encrypted.toString('hex') };
}

function decrypt(text) {
 let encryptedText = Buffer.from(text.encryptedData, 'hex');
 let decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(text.key), text.iv);
 let decrypted = decipher.update(encryptedText);
 decrypted = Buffer.concat([decrypted, decipher.final()]);
 return decrypted.toString();
}

app.use(function(req, res, next){

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Credentials", true);

    next();

});

app.post("/encrypt", function(req, res){

    var key = Buffer.from(req.body.Chave);
    var iv = Buffer.from(new ArrayBuffer(16));

    var texto = JSON.stringify(req.body.Json);
    let text = { text:texto , key:key , iv:iv }

    var output = encrypt(text); 
    
    var response = { Resultado: hexToBase64(output.encryptedData) }
    res.json(response);

});

app.post("/decrypt", function(req, res){

    var key = Buffer.from(req.body.Chave);
    var iv = Buffer.from(new ArrayBuffer(16));

    var texto = req.body.Json;
    let text = { text:texto , key:key , iv:iv }

    let dataHex = base64ToHex(texto);
    dataHex = dataHex.split(' ');
    dataHex = dataHex.join('');
    text.encryptedData = dataHex;
    let decriptado = decrypt( text )

    var response = JSON.parse(decriptado);
    res.json(response);

});

app.listen(9090, function(){ 
    
    console.log("Servidor Web - Porta: 9090");
    console.log("Desenvolvido por cmacetko@gmail.com");

});