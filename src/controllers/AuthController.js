const getHealth = async (req, res) => {
    return res.status(200).json({ status: "ok", message: "beauty robot api está funcionando perfeitamente!" });
};

export default { getHealth };