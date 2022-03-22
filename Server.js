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
    try{
        var tabela = fs.readFileSync('./tabela.json')
        app.result = JSON.parse(tabela);
    }catch(e){}
    resp.render('index.ejs', {tabela: app.result, data: dzis, numer: ""});
})
app.get('/wydaj', (req, resp) => {
    try{
        var tabela = fs.readFileSync('./tabela.json')
        var tabelaJ = JSON.parse(tabela);
    }catch(e){}
    const months = ["Styczen", "Luty", "Marzec", "Kwiecien", "Maj", "Czerwiec", "Lipiec", "Sierpien", "Wrzesien", "Pazdziernik", "Listopad", "Grudzien"];
    var d = new Date()
    var dzis = d.getDate() + "." +months[d.getMonth()] + "." + d.getFullYear();
    if(req.query.wydaj){
        for(var i=0; i < tabelaJ.length; i++){
            if(tabelaJ[i].numer == req.query.numer){
                if(req.query.obiad){
                    tabelaJ[i].obiad=dzis;
                }
                if(req.query.zywnosc){
                    tabelaJ[i].zywnosc=dzis;
                }
                if(req.query.chemia){
                    tabelaJ[i].chemia=dzis;
                }
                if(req.query.inne){
                    tabelaJ[i].inne=dzis;
                }
            }
        }
        tabela = JSON.stringify(tabelaJ);
        fs.writeFileSync('./tabela.json', tabela);
        resp.render('index.ejs', {tabela: tabelaJ, data: dzis, numer: req.query.numer});
    }
    if(req.query.szukaj){
        var tabelaS = [];
        for(var i=0; i < tabelaJ.length; i++){
            if(tabelaJ[i].numer.endsWith(req.query.numer)){
                tabelaS.push(tabelaJ[i]);
            }
        }
        resp.render('index.ejs', {tabela: tabelaS, data: dzis, numer: req.query.numer});
    }
})