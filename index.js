console.log('run');

const restify = require('restify');
const mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost:27017/cows')
mongoose.connect('mongodb://mongo/cows')

const Schema = mongoose.Schema;

const ReportSchema = new Schema({
    name: String,
    cowId: String,
    uuid: String,
    timestamp: {type: Date, default: Date.now},
    knee: {type: Number, default: 1, max: 4},
    hock: {type: Number, default: 1, max: 4},
    neck: {type: Number, default: 1, max: 4}
});

const ReportModel = mongoose.model('Cow', ReportSchema);

const server = restify.createServer();

server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.get('/', (req, res, next) => {
    res.send('this worked');
})

server.get('/reports/:cow', (req, res, next) => {
    console.log(req.params.cow);
    let name = req.params.cow;
    ReportModel.findOne({name}, (err, docs) => {
        console.log(docs);
        var str;
        if (err || !docs) {
            str = 'Sorry, there were no recent reports with cows by that name.';
        } else {
            str = `${name} has a knee score of ${docs.knee}, a hock score of ${docs.hock}, and a neck score of ${docs.neck}.`;
        }
        
        res.send(str);
    });
});

server.get('/reports/stage', (req, res, next) => {
    let num = req.query.stage;
    ReportModel.find({}, (err, docs) => {
        var kneeStr = '';
        var hockStr = '';
        var neckStr = '';
        docs.forEach(report => {
            if (report.knee == num && kneeStr.indexOf(report.name) == -1){
                kneeStr += ' ' + report.name + ', ';
            }
            if (report.hock == num && hockStr.indexOf(report.name) == -1){
                hockStr += ' ' + report.name + ', ';
            }
            if (report.neck == num && neckStr.indexOf(report.name) == -1){
                neckStr += ' ' + report.name + ', ';
            }
        });

        if (kneeStr) {
            kneeStr = 'The following cows had knee scores of ' + num + ': ' + kneeStr;
        }
        if (hockStr) {
            hockStr = 'The following cows had hock scores of ' + num + ': ' + hockStr;
        }
        if (neckStr) {
            neckStr = 'The following cows had neck scores of ' + num + ': ' + neckStr;
        }

        if (kneeStr || hockStr || neckStr) {
            res.send(kneeStr + hockStr + neckStr);
        } else {
            res.send('Sorry, there were no cows with that injury stage');
        }

    });
});

server.get('/reports', (req, res, next) => {
    ReportModel.find({}, (err, docs) => {
        if (req.query.stage) {
            let num = req.query.stage;
            var kneeStr = '';
            var hockStr = '';
            var neckStr = '';
            docs.forEach(report => {
                if (report.knee == num && kneeStr.indexOf(report.name) == -1){
                    kneeStr += ' ' + report.name + ', ';
                }
                if (report.hock == num && hockStr.indexOf(report.name) == -1){
                    hockStr += ' ' + report.name + ', ';
                }
                if (report.neck == num && neckStr.indexOf(report.name) == -1){
                    neckStr += ' ' + report.name + ', ';
                }
            });

            if (kneeStr) {
                kneeStr = 'The following cows had knee scores of ' + num + ': ' + kneeStr;
            }
            if (hockStr) {
                hockStr = 'The following cows had hock scores of ' + num + ': ' + hockStr;
            }
            if (neckStr) {
                neckStr = 'The following cows had neck scores of ' + num + ': ' + neckStr;
            }

            if (kneeStr || hockStr || neckStr) {
                res.send(kneeStr + hockStr + neckStr);
            } else {
                res.send('Sorry, there were no cows with stage ' + num + ' injuries');
            }
        } else if (req.query.alexa) {
            var str = 'Today, you entered ' + docs.length + ' injury reports. ';
            var numStage3 = 0;
            docs.forEach(report => {
                // str += `${report.name} has a knee score of ${report.knee} `;
                if (report.knee == 3){
                    numStage3++;
                }
                if (report.hock == 3){
                    numStage3++;
                }
                if (report.neck == 3){
                    numStage3++;
                }
            });
            str += numStage3 + ' included stage 3 injuries.';
            console.log(str);
            res.send(str);
        } else {
            var cows = [];
            var list = [];
            docs.forEach(report => {
                if (cows.indexOf(report.name) == - 1) {
                    cows.push(report.name);
                    list.push({
                        name    : report.name,
                        cowId   : report.cowId,
                        reports : [{
                            timestamp : report.timestamp,
                            knee      : report.knee,
                            hock      : report.hock,
                            neck      : report.neck
                        }]
                    });
                } else {
                    list[cows.indexOf(report.name)].reports.push({
                        timestamp : report.timestamp,
                            knee      : report.knee,
                            hock      : report.hock,
                            neck      : report.neck
                    });
                }
            });

            res.send(list);
        }
    });
});

server.post('/report', (req, res, next) => {
    var body = JSON.parse(req.body);
    if (body.name && body.cowId) {
        var report = new ReportModel;
        report.name = body.name;
        report.cowId = body.cowId;
        report.knee = body.knee || 0;
        report.hock = body.hock || 0;
        report.neck = body.neck || 0;
        report.timestamp = '2018-12-18 22:14:38.028Z';
        report.save(err => {
            if (err) {
                console.log(err);
                res.send(500);
            } else {
                res.send(200);
            }
        });
    } else {
        res.send(400);
    }
});

server.listen(8080, () => {
    console.log('Listening on 8080');
});