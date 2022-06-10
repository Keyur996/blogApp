'use strict';

const multer = require('multer');
const path = require('path');
const ErrorResponse = require('./../utils/errorResponse');

const MIME_TYPE = {
    'image/png': 'png',
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg'
}

const getStorage = () => {
    const storage = multer.diskStorage({
        destination: path.join(process.cwd(), 'backend/images'),
        filename: (req, file, cb) => {
            const ext = MIME_TYPE[file.mimetype]
            cb(null, `${Date.now()}-${file.originalname}.${ext}`);
        }
    });

    return storage;
}

const multerFilter = (req, file, cb) => {
    const isValid = MIME_TYPE[file.mimetype];
    let error = new ErrorResponse('Invalid file format', 400);
    if(isValid) {
        error = null
    }
    cb(error, !!isValid);
}

const uploader = (fieldName) => {
    const upload = multer({
        storage: getStorage(),
        fileFilter: multerFilter
    });
    return upload.single(fieldName);
}

module.exports = { 
    uploader: uploader
};