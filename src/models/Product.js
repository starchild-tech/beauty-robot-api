import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: [{
        type: String,
        required: true
    }],
    keywords: [String]
}, { timestamps: true });

productSchema.plugin(mongoosePaginate);
export default mongoose.model("Product", productSchema);