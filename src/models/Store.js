import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    baseUrl: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    builder: {
        type: String,
        required: true
    },
    selectors: {
        productList: String,
        productName: String,
        productPrice: String,
        productOriginalPrice: String,
        productLink: String,
        productCarouselItem: String,
        productCustomButton: String,
        cartAddButton: String,
        singleProductName: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

storeSchema.plugin(mongoosePaginate);
export default mongoose.model("Store", storeSchema);