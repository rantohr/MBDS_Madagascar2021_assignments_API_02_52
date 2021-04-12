import * as mongoose from "mongoose";
import * as mongoosePaginate from "mongoose-paginate-v2";

const Schema = mongoose.Schema;

const AssignmentSchema = new Schema({
    dateDeRendu: {
        type: Date,
        required: false,
    },
    nom: {
        type: String,
        required: true,
        trim: true
    },
    rendu: {
        type: Boolean,
        default: false
    },
    matiere: {
        type: Schema.Types.ObjectId,
        ref: "Subject",
        required: false
    },
    auteur: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    note: {
        type: Number,
        required: false
    },
    remarques: {
        type: String,
        required: false
    }
}, { _id: true });

AssignmentSchema.plugin(mongoosePaginate);

export default mongoose.model('Assignment', AssignmentSchema)
