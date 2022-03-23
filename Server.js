const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
var port = process.env.PORT;
if(port == null || port == ""){
    port = 8080;
}
app.result=[];
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engein', 'ejs');
app.listen(port, function() {
    console.log('Nasluch na 8080');
});
app.get('/', (req, resp) => {
    const months = ["Styczen", "Luty", "Marzec", "Kwiecien", "Maj", "Czerwiec", "Lipiec", "Sierpien", "Wrzesien", "Pazdziernik", "Listopad", "Grudzien"];
    var d = new Date()
    var dzis = d.getDate() + "." +months[d.getMonth()] + "." + d.getFullYear();
    var dzisT = d.getFullYear()*10000+d.getMonth()*100+d.getDate();
    try{
        var tabela = fs.readFileSync('./tabela.json')
        app.result = JSON.parse(tabela);
    }catch(e){}
    var report=[0,0,0,0];
    for(var i=0; i < app.result.length; i++){
        if(dzisT == app.result[i].obiad){
            report[0]++;
        }
        if(dzisT == app.result[i].zywnosc){
            report[1]++;
        }
        if(dzisT == app.result[i].chemia){
            report[2]++;
        }
        if(dzisT == app.result[i].inne){
            report[3]++;
        }
    }
    resp.render('index.ejs', {tabela: app.result, data: dzis, dataT: dzisT, numer: "", raport: report});
})
app.get('/wydaj', (req, resp) => {
    try{
        var tabela = fs.readFileSync('./tabela.json')
        var tabelaJ = JSON.parse(tabela);
    }catch(e){}
    const months = ["Styczen", "Luty", "Marzec", "Kwiecien", "Maj", "Czerwiec", "Lipiec", "Sierpien", "Wrzesien", "Pazdziernik", "Listopad", "Grudzien"];
    var d = new Date()
    var dzis = d.getDate() + " " +months[d.getMonth()] + " " + d.getFullYear();
    var dzisT = d.getFullYear()*10000+d.getMonth()*100+d.getDate();
    var report=[0,0,0,0];
    for(var i=0; i < tabelaJ.length; i++){
        if(dzisT == tabelaJ[i].obiad){
            report[0]++;
        }
        if(dzisT == tabelaJ[i].zywnosc){
            report[1]++;
        }
        if(dzisT == tabelaJ[i].chemia){
            report[2]++;
        }
        if(dzisT == tabelaJ[i].inne){
            report[3]++;
        }
    }
    if(req.query.wydaj){
        for(var i=0; i < tabelaJ.length; i++){
            if(tabelaJ[i].numer == req.query.numer){
                if(req.query.obiad){
                    tabelaJ[i].obiad=dzisT;
                    report[0]++;
                }
                if(req.query.zywnosc){
                    tabelaJ[i].zywnosc=dzisT;
                    report[1]++;
                }
                if(req.query.chemia){
                    tabelaJ[i].chemia=dzisT;
                    report[2]++;
                }
                if(req.query.inne){
                    tabelaJ[i].inne=dzisT;
                    report[3]++;
                }
            }
        }
        tabela = JSON.stringify(tabelaJ);
        fs.writeFileSync('./tabela.json', tabela);
        resp.render('index.ejs', {tabela: tabelaJ, data: dzis, dataT: dzisT, numer: req.query.numer, raport: report});
    }
    if(req.query.szukaj){
        var tabelaS = [];
        for(var i=0; i < tabelaJ.length; i++){
            if(tabelaJ[i].numer.endsWith(req.query.numer)){
                tabelaS.push(tabelaJ[i]);
            }
        }
        resp.render('index.ejs', {tabela: tabelaS, data: dzis, dataT: dzisT, numer: req.query.numer, raport: report});
    }
})