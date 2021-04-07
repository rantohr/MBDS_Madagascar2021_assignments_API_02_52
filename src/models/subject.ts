import * as mongoose from "mongoose";

const Schema = mongoose.Schema;

const SubjectSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: false,
        trim: true
    },
    teacher: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
}, { _id: true });

export default mongoose.model('Subject', SubjectSchema)
