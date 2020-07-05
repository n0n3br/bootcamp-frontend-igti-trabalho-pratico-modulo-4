const Accounts = require("../database/models/accounts");

module.exports.list = async (_, res) => {
  const records = await Accounts.find();
  res.status(200).json(records);
};
module.exports.deposit = async (req, res) => {
  try {
    const { valor, conta, agencia } = req.body;
    if (!(valor >= 0))
      return res.status(500).send({ message: "valor de deposito invalido" });
    const record = await Accounts.findOne({ conta, agencia });
    if (!record) return res.status(500).send({ message: "conta inexistente" });
    record.balance += valor;
    await record.save();
    res.status(200).send({ balance: record.balance });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
module.exports.withdraw = async (req, res) => {
  try {
    const { valor, conta, agencia } = req.body;
    if (!(valor >= 0))
      return res.status(500).send({ message: "valor de saque invalido" });
    const record = await Accounts.findOne({ conta, agencia });
    if (!record) return res.status(500).send({ message: "conta inexistente" });
    if (record.balance < valor)
      return res.status(500).send({ message: "saldo insuficiente para saque" });
    record.balance = record.balance - valor - 1;
    await record.save();
    res.status(200).send({ balance: record.balance });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
module.exports.balance = async (req, res) => {
  try {
    const { conta, agencia } = req.body;
    const record = await Accounts.findOne({ conta, agencia });
    if (!record) return res.status(500).send({ message: "conta inexistente" });
    res.status(200).json({ balance: record.balance });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports.del = async (req, res) => {
  try {
    const { conta, agencia } = req.body;
    await Accounts.findOneAndRemove({ conta, agencia });
    const records = await Accounts.find({ agencia });
    res.status(200).send({ agencia, contas: records.length });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports.transfer = async (req, res) => {
  try {
    const { conta_origem, conta_destino, valor } = req.body;
    const [origem, destino] = await Promise.all([
      Accounts.findOne({ conta: conta_origem }),
      Accounts.findOne({ conta: conta_destino }),
    ]);
    if (!origem || !destino)
      return res
        .status(500)
        .send({ message: "conta origem ou destino inexistentes" });
    const tarifa = origem.agencia !== destino.agencia ? 8 : 0;
    if (tarifa + valor > origem.balance)
      return res
        .status(500)
        .send({ message: "saldo insuficiente para transferencia" });
    origem.balance = origem.balance - tarifa - valor;
    destino.balance += valor;
    await Promise.all([origem.save(), destino.save()]);
    res.status(200).send({ balance: origem.balance });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports.average = async (req, res) => {
  try {
    const { agencia } = req.body;
    const record = await Accounts.aggregate([
      { $match: { agencia } },
      { $group: { _id: "$agencia", avg: { $avg: "$balance" } } },
    ]);
    if (!record.length)
      return res.status(500).send({ message: "agencia inexistente" });
    res.status(200).send({ agencia, media: record[0].avg });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
module.exports.minimum = async (req, res) => {
  try {
    const { quantidade } = req.body;
    const records = await Accounts.aggregate([
      { $sort: { balance: 1 } },
      { $limit: quantidade },
    ]);
    res.status(200).send(records);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
module.exports.maximum = async (req, res) => {
  try {
    const { quantidade } = req.body;
    const records = await Accounts.aggregate([
      { $sort: { balance: -1 } },
      { $limit: quantidade },
    ]);
    res.status(200).send(records);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports.private = async (req, res) => {
  try {
    const aggregation = await Accounts.aggregate([
      { $sort: { balance: -1 } },
      { $group: { _id: "$agencia", conta: { $first: "$conta" } } },
    ]);
    await Accounts.updateMany(
      {
        conta: { $in: aggregation.map((a) => a.conta) },
      },
      { $set: { agencia: 99 } }
    );
    const contasPrivate = await Accounts.find({ agencia: 99 });
    res.status(200).send(contasPrivate);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
