import Product from "../models/Product.js";
import mongoose from "mongoose";

const index = async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const products = await Product.paginate({}, { page, limit: 10 });

        return res.status(200).json(products);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erro ao listar produtos" });
    }
};

const store = async (req, res) => {
    try {
        const { name } = req.body;

        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            return res.status(400).json({ message: "Produto já cadastrado" });
        }

        const newProduct = await Product.create(req.body);

        return res.status(201).json(newProduct);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erro ao cadastrar produto" });
    }
};

const update = async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID fornecido não é válido." });
    }

    try {
        const product = await Product.findByIdAndUpdate(id, { ...req.body, id }, { new: true });
        return res.status(200).json(product);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erro ao atualizar produto" });
    }
}

export default { index, store, update };