import { Router } from 'express';
import * as multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/tmp/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

class UploadRouter {
    router: Router;
    upload: any;

    constructor() {
        this.upload = multer({
            storage
        });
        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.post('/', this.upload.single('file'), (req, res) => {
            res.status(200).json({ success: true, body: req.body });
        });
    }
}

export default new UploadRouter().router;