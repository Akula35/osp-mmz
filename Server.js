const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion, ConnectionCheckedInEvent } = require('mongodb');
const uri = "mongodb+srv://ops-user:nAb0hvHrSAd1rcGe@osp-mmz.largd.mongodb.net/osp?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const app = express();
const fs = require('fs');
const { ppid } = require('process');
var port = process.env.PORT;
if(port == null || port == ""){
    port = 8080;
}
app.result=[];
app.reports=[];

async function readTable() {
    await client.connect();
    const collection = client.db("osp").collection("pomoc-humanitarna");
    collection.find({},{numer: 1, zywnosc: 1, mleko: 1, olej: 1, maka: 1, cukier: 1, chemia: 1, inne: 1, ile: 1}).sort({numer: 1}).toArray( function(err,result) {
      if (err) throw err;
      app.result = result;
      var d = new Date();
      var dzisT = d.getDay();
      if (dzisT %2 == 0){
        dzisT = dzisT - 1;
    }
      app.reports = [0,0,0]
      for(var i=0; i < app.result.length; i++){
        if(dzisT <= app.result[i].zywnosc){
            app.reports[0]++;
        }
        if(dzisT <= app.result[i].chemia){
            app.reports[1]++;
        }
        if(dzisT <= app.result[i].inne){
            app.reports[2]++;
        }
    }
      client.close();
  })
}
readTable();

async function writeTable(num, zyw, mle, ole, mak, cuk, che, ine){
    values = [0,0,0,0,0,0,0,0];
    var d = new Date();
    var dzisT = d.getDay();
    if (dzisT %2 == 0){
        dzisT = dzisT - 1;
    }
    for(var i=0; i < app.result.length; i++){
        if(app.result[i].numer == num){
            if(app.result[i].zywnosc < zyw){
                values[0] = app.result[i].zywnosc + zyw;
            }else{
                values[0] = app.result[i].zywnosc
            }
            if(app.result[i].mleko < mle){
                values[1] = app.result[i].mleko + mle;
            }else{
                values[1] = app.result[i].mleko
            }
            if(app.result[i].olej < ole){
                values[2] = app.result[i].olej + ole;
            }else{
                values[2] = app.result[i].olej
            }
            if(app.result[i].maka < mak){
                values[3] = app.result[i].maka + mak;
            }else{
                values[3] = app.result[i].maka
            }
            if(app.result[i].cukier < cuk){
                values[4] = app.result[i].cukier + cuk;
            }else{
                values[4] = app.result[i].cukier
            }
            if(app.result[i].chemia < che){
                values[5] = app.result[i].chemia + che;
            }else{
                values[5] = app.result[i].chemia
            }
            if(app.result[i].inne < ine){
                values[6] = app.result[i].inne + ine;
            }else{
                values[6] = app.result[i].inne
            }
                values[7] = app.result[i].ile + 1;
        }
    }
    await client.connect();
    const collection = client.db("osp").collection("pomoc-humanitarna");
    collection.updateOne({numer: num},{$set: {zywnosc: values[0], mleko: values[1], olej: values[2], maka: values[3], cukier: values[4], chemia: values[5], inne: values[6], ile: values[7]}},{upsert: true})
    collection.find({},{numer: 1, zywnosc: 1, mleko: 1, olej: 1, maka: 1, cukier: 1, chemia: 1, inne: 1, ile: 1}).sort({numer: 1}).toArray( function(err,result) {
        if (err) throw err;
        app.result = result;
        app.reports = [0,0,0]
        for(var i=0; i < app.result.length; i++){
          if(dzisT <= app.result[i].zywnosc){
              app.reports[0]++;
          }
          if(dzisT <= app.result[i].chemia){
              app.reports[1]++;
          }
          if(dzisT <= app.result[i].inne){
              app.reports[2]++;
          }
      }
        client.close();
    })
}

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engein', 'ejs');
app.listen(port, function() {
    console.log('Nasluch na 8080');
});

app.get('/', async (req, resp) => {
    const months = ["Styczen", "Luty", "Marzec", "Kwiecien", "Maj", "Czerwiec", "Lipiec", "Sierpien", "Wrzesien", "Pazdziernik", "Listopad", "Grudzien"];
    var d = new Date();
    var dzisT = d.getDay();
    if (dzisT %2 == 0){
        dzisT = dzisT - 1;
    }
    var dzis = d.getDate() + " " +months[d.getMonth()] + " " + d.getFullYear();
    var punkts;
    try{
        punkts = JSON.parse(fs.readFileSync("./punkty.json"));
    }catch(e){}
    resp.render('index.ejs', {tabela: app.result, data: dzis, dataT: dzisT, numer: "", raport: app.reports, punkty: punkts, blad: 'flase'});
})

app.get('/wydaj', (req, resp) => {
    const months = ["Styczen", "Luty", "Marzec", "Kwiecien", "Maj", "Czerwiec", "Lipiec", "Sierpien", "Wrzesien", "Pazdziernik", "Listopad", "Grudzien"];
    var d = new Date()
    var dzis = d.getDate() + " " +months[d.getMonth()] + " " + d.getFullYear();
    var dzisT = d.getDay();
    if (dzisT %2 == 0){
        dzisT = dzisT - 1;
    }
    var punkts;
    try{
        punkts = JSON.parse(fs.readFileSync("./punkty.json"));
    }catch(e){}
    if(req.query.numer.length != 4){
        resp.render('index.ejs', {tabela: app.result, data: dzis, dataT: dzisT, numer: req.query.numer, raport: app.reports, punkty: punkts, blad: 'true'});
    }
    if(req.query.wydaj){
        var wydaj = [0,0,0,0,0,0,0];
        if(req.query.zywnosc){
            wydaj[0]= dzisT;
        }
        if(req.query.mleko){
            wydaj[1] = dzisT;
        }
        if(req.query.olej){
            wydaj[2] = dzisT;
        }
        if(req.query.maka){
            wydaj[3] = dzisT;
        }
        if(req.query.cukier){
            wydaj[4] = dzisT;
        }
        if(req.query.chemia){
            wydaj[5] = dzisT;
        }
        if(req.query.inne){
            wydaj[6] = dzisT;
        }     
        writeTable(req.query.numer, wydaj[0], wydaj[1], wydaj[2], wydaj[3], wydaj[4], wydaj[5], wydaj[6]);
        resp.render('wydano.ejs', {numer: req.query.numer, wydane: wydaj});
    }
    if(req.query.szukaj){
        var tabelaS = [];
        for(var i=0; i < app.result.length; i++){
            if(app.result[i].numer.endsWith(req.query.numer)){
                tabelaS.push(app.result[i]);
            }
        }
        
        resp.render('index.ejs', {tabela: tabelaS, data: dzis, dataT: dzisT, numer: req.query.numer, raport: app.reports, punkty: punkts, blad: 'flase'});
    }
})

app.get('/potwierdz', (req, resp) => {
    const months = ["Styczen", "Luty", "Marzec", "Kwiecien", "Maj", "Czerwiec", "Lipiec", "Sierpien", "Wrzesien", "Pazdziernik", "Listopad", "Grudzien"];
    var d = new Date();
    var dzisT = d.getDay();
    if (dzisT %2 == 0){
        dzisT = dzisT - 1;
    }
    var dzis = d.getDate() + " " +months[d.getMonth()] + " " + d.getFullYear();
    var punkts;
    try{
        punkts = JSON.parse(fs.readFileSync("./punkty.json"));
    }catch(e){}
    resp.render('index.ejs', {tabela: app.result, data: dzis, dataT: dzisT, numer: req.query.numer, raport: app.reports, punkty: punkts, blad: 'flase'});
})

app.get('/zapasy', (req, resp) => {
    var punkts;
    try{
        punkts = JSON.parse(fs.readFileSync("./punkty.json"));
    }catch(e){}
    for(var i=0; i<punkts.length; i++){
        if(punkts[i].nazwa == req.query.punkt){
            if(req.query.mleko){
                punkts[i].mleko = "tak";
            }else{
                punkts[i].mleko = "nie";
            }
            if(req.query.kasza){
                punkts[i].kasza = "tak";
            }else{
                punkts[i].kasza = "nie";
            }
            if(req.query.maka){
                punkts[i].maka = "tak";
            }else{
                punkts[i].maka = "nie";
            }
            if(req.query.olej){
                punkts[i].olej = "tak";
            }else{
                punkts[i].olej = "nie";
            }
            if(req.query.cukier){
                punkts[i].cukier = "tak";
            }else{
                punkts[i].cukier = "nie";
            }
            if(req.query.konserwy){
                punkts[i].konserwy = "tak";
            }else{
                punkts[i].konserwy = "nie";
            }
        }
    }
    fs.writeFileSync('./punkty.json', JSON.stringify(punkts));
    resp.redirect('/');
})

async function resetTable(){
    values = [0,0,0,0,0,0,0];
    await client.connect();
    const collection = client.db("osp").collection("pomoc-humanitarna");
    await collection.updateMany({},{$set: {zywnosc: values[0], mleko: values[1], olej: values[2], maka: values[3], cukier: values[4], chemia: values[5], inne: values[6]}},{upsert: true})
    await client.close();
}

app.get('/reset', (req, resp) => {
    resetTable();
    readTable();
    resp.redirect("/");
})