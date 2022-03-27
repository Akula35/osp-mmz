const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://ops-user:nAb0hvHrSAd1rcGe@osp-mmz.largd.mongodb.net/osp?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const app = express();
const fs = require('fs');
var port = process.env.PORT;
if(port == null || port == ""){
    port = 8080;
}
app.result=[];
app.reports=[];
async function readTable() {
    await client.connect();
    const collection = client.db("osp").collection("pomoc-humanitarna");
    collection.find({},{numer: 1, obiad: 1, zywnosc: 1, chemia: 1, inne: 1}).toArray( function(err,result) {
      if (err) throw err;
      app.result = result;
      var d = new Date();
      var dzisT = d.getFullYear()*10000+d.getMonth()*100+d.getDate();
      app.reports = [0,0,0,0]
      for(var i=0; i < app.result.length; i++){
        if(dzisT == app.result[i].obiad){
            app.reports[0]++;
        }
        if(dzisT == app.result[i].zywnosc){
            app.reports[1]++;
        }
        if(dzisT == app.result[i].chemia){
            app.reports[2]++;
        }
        if(dzisT == app.result[i].inne){
            app.reports[3]++;
        }
    }
      client.close();
  })
}
readTable();
async function writeTable(num, obi, zyw, che, ine){
    var d = new Date();
    var dzisT = d.getFullYear()*10000+d.getMonth()*100+d.getDate();
    var values = [0,0,0,0]
    for(var i=0; i < app.result.length; i++){
        if(app.result[i].numer == num){
            values[0] = app.result[i].obiad;
            values[1] = app.result[i].zywnosc;
            values[2] = app.result[i].chemia;
            values[3] = app.result[i].inne;
        }
    }
    if(obi == 1){
        values[0]=dzisT;
    }
    if(zyw == 1){
        values[1]=dzisT;
    }
    if(che == 1){
        values[2]=dzisT;
    }
    if(ine == 1){
        values[3]=dzisT;
    }
    await client.connect();
    const collection = client.db("osp").collection("pomoc-humanitarna");
    collection.updateOne({numer: num},{$set: {obiad: values[0], zywnosc: values[1], chemia: values[2], inne: values[3]}},{upsert: true})
    collection.find({},{numer: 1, obiad: 1, zywnosc: 1, chemia: 1, inne: 1}).toArray( function(err,result) {
        if (err) throw err;
        app.result = result;
        console.log(app.result);
        var d = new Date();
        var dzisT = d.getFullYear()*10000+d.getMonth()*100+d.getDate();
        app.reports = [0,0,0,0]
        for(var i=0; i < app.result.length; i++){
          if(dzisT == app.result[i].obiad){
              app.reports[0]++;
          }
          if(dzisT == app.result[i].zywnosc){
              app.reports[1]++;
          }
          if(dzisT == app.result[i].chemia){
              app.reports[2]++;
          }
          if(dzisT == app.result[i].inne){
              app.reports[3]++;
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
    var dzisT = d.getFullYear()*10000+d.getMonth()*100+d.getDate();
    var dzis = d.getDate() + " " +months[d.getMonth()] + " " + d.getFullYear();
    var punkts;
    try{
        punkts = JSON.parse(fs.readFileSync("./punkty.json"));
    }catch(e){}
    resp.render('index.ejs', {tabela: app.result, data: dzis, dataT: dzisT, numer: "", raport: app.reports, punkty: punkts});
})
app.get('/wydaj', (req, resp) => {
    const months = ["Styczen", "Luty", "Marzec", "Kwiecien", "Maj", "Czerwiec", "Lipiec", "Sierpien", "Wrzesien", "Pazdziernik", "Listopad", "Grudzien"];
    var d = new Date()
    var dzis = d.getDate() + " " +months[d.getMonth()] + " " + d.getFullYear();
    var dzisT = d.getFullYear()*10000+d.getMonth()*100+d.getDate();
    if(req.query.wydaj){
        var wydaj = [0,0,0,0];
        if(req.query.obiad){
            wydaj[0]++;
        }
        if(req.query.zywnosc){
            wydaj[1]++;
        }
        if(req.query.chemia){
            wydaj[2]++;
        }
        if(req.query.inne){
            wydaj[3]++;
        }     
        writeTable(req.query.numer, wydaj[0], wydaj[1], wydaj[2], wydaj[3]);
        resp.render('wydano.ejs', {numer: req.query.numer, wydane: wydaj});
    }
    if(req.query.szukaj){
        var tabelaS = [];
        for(var i=0; i < app.result.length; i++){
            if(app.result[i].numer.endsWith(req.query.numer)){
                tabelaS.push(app.result[i]);
            }
        }
        var punkts;
        try{
            punkts = JSON.parse(fs.readFileSync("./punkty.json"));
        }catch(e){}
        resp.render('index.ejs', {tabela: tabelaS, data: dzis, dataT: dzisT, numer: req.query.numer, raport: app.reports, punkty: punkts});
    }
})
app.get('/potwierdz', (req, resp) => {
    var punkts;
    try{
        punkts = JSON.parse(fs.readFileSync("./punkty.json"));
    }catch(e){}
    for(var i=0; i<punkts.length; i++){
        if(punkts[i].nazwa == req.query.punkt){
            if(req.query.mleko){
                punkts[i].mleko = true;
            }
            if(req.query.kasza){
                punkts[i].kasza = true;
            }
            if(req.query.maka){
                punkts[i].maka = true;
            }
            if(req.query.olej){
                punkts[i].olej = true;
            }
            if(req.query.cukier){
                punkts[i].cukier = true;
            }
            if(req.query.konserwy){
                punkts[i].konserwy = true;
            }
        }
    }
    fs.writeFileSync('./punkty.json', JSON.stringify(punkts));
    resp.redirect('/')
})