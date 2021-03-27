import * as http from 'http';
import server from "./server";
import config from './environments';

const PORT = (process.env.PORT || config.APP_PORT);
const app = http.createServer(server.app);

server.routes();

app.listen(PORT, () => {
    console.log('Express server listening on port ' + PORT);
})
