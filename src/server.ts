
import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';

const app = express();
var morgan = require('morgan')

const port: number = 8080;

let logDir: string;
if (process.argv.length >= 3) {
    logDir = fs.realpathSync(process.argv[2]);
} else {
    logDir = "/var/log/webmon";
}

const webDir: string = fs.realpathSync(path.join(__dirname, 'web'));

console.log(`Logs dir ${logDir}`);
console.log(`Web dir ${webDir}`);

app.use(morgan('combined'))
app.use("/", express.static(webDir));
app.use("/logs", express.static(logDir));
app.get('/list', (req, res) => {

    fs.readdir(logDir, (err, files) => {
        let filtered: Array<string> = [];
        if (files) {
            filtered = files.filter((value) => {
                return value.endsWith('.log');
            });
        }

        res.send(filtered);
    })
});

app.listen(port, () => console.log(`Listening on port ${port}!`));