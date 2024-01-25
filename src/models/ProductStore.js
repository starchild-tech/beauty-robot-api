import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productStoreSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    name: String,
    price: Number,
    url: String
}, { timestamps: true });

productStoreSchema.plugin(mongoosePaginate);
export default mongoose.model("ProductStore", productStoreSchema);