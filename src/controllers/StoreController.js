import Store from "../models/Store.js";
import mongoose from "mongoose";

const index = async (req, res) => {
    try {
        const {
            limit = 20,
            page = 1,
            order = "desc",
            sortBy = "createdAt",
            search = "",
        } = req.query;
        const stores = await Store.paginate({
            name: {
                $regex: search,
                $options: "i",
            },
        }, { page, limit: parseInt(limit), sort: { [sortBy]: order } });

        return res.status(200).json(stores);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao listar lojas" });
    }
};

const store = async (req, res) => {
    try {
        const { name } = req.body;

        const existingStore = await Store.findOne({ name });
        if (existingStore) {
            return res.status(400).json({ message: "Loja já cadastrada" });
        }

        const newStore = await Store.create(req.body);

        return res.status(201).json(newStore);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao cadastrar loja" });
    }
};

const update = async (req, res) => {
    const id = req.params.id;

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID fornecido não é válido." });
    };

    try {
        const store = await Store.findByIdAndUpdate(id, { ...req.body, id }, { new: true });
        return res.status(200).json(store);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao atualizar loja" });
    }
};

export default { index, store, update };