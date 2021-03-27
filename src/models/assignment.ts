import * as mongoose from "mongoose";
import * as aggregatePaginate from "mongoose-aggregate-paginate-v2";

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
    }
}, { _id: true });

AssignmentSchema.plugin(aggregatePaginate);

export default mongoose.model('Assignment', AssignmentSchema)
