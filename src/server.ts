import * as express from 'express';
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as path from 'path'

import config from "./environments";
import AuthenticationRouter from './routes/authentication';
import AssignmentsRouter from './routes/assignments';

// Server class
class Server {

    public app: express.Application;

    constructor() {
        this.app = express()
        this.config()
    }

    public config() {
        // set up mongoose
        console.log('Config....', config)
        console.log('Connecting to DB....', config.MONGODB_URI)
        mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
            .then(() => console.log('Database connected.'))
            .catch((e) => console.log('Error connection db.', e))
        mongoose.set('useFindAndModify', false);
        mongoose.pluralize(null);

        // config
        this.app.use(bodyParser.json({ limit: '100mb' }));
        this.app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
        this.app.use(cors())
        this.app.use('/public', express.static(path.join(process.cwd(), 'public')))
    }

    public routes(): void {
        this.app.use('/api/auth', AuthenticationRouter)
        this.app.use('/api/assignments', AssignmentsRouter)
    }
}

export default new Server();
