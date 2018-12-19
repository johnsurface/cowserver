console.log('run');

const restify = require('restify');
const mongoose = require('mongoose');

mongoose.connect('mongodb://mongo/cows')

const Schema = mongoose.Schema;

const ReportSchema = new Schema({
    name: String,
    cowId: String,
    uuid: String,
    timestamp: {type: Date, default: Date.now},
    knee: {type: Number, default: 0, max: 3},
    hock: {type: Number, default: 0, max: 3},
    neck: {type: Number, default: 0, max: 3}
});

const ReportModel = mongoose.model('Cow', ReportSchema);

// const test = new ReportModel;

// test.name = 'Mojito';
// test.knee = 2;
// test.save();



const server = restify.createServer();

server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.get('/', (req, res, next) => {
    res.send('this worked');
})

server.get('/reports', (req, res, next) => {
    ReportModel.find({}, (err, docs) => {
        var str = '';
        docs.forEach(report => {
            str += `${report.name} has a knee score of ${report.knee} `;
        });
        console.log(str);
        // res.json({
        //     code: 200
        // });
        res.send(str);
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