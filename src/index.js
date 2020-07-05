const express = require("express");
const dotenv = require("dotenv");
const database = require("./database");
const accountsRouter = require("./routes/accounts");
dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use("/api/accounts", accountsRouter);
database.connect();

app.listen(port, () => {
  console.info(`=> Server listening on port ${port}`);
});
