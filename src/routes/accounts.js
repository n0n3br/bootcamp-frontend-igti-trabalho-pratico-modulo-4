const Router = require("express").Router;
const accountsController = require("../controllers/accounts");

const router = new Router();
router.get("/", accountsController.list);
router.post("/minimum", accountsController.minimum);
router.post("/maximum", accountsController.maximum);
router.post("/average", accountsController.average);
router.post("/balance", accountsController.balance);
router.post("/deposit", accountsController.deposit);
router.post("/withdraw", accountsController.withdraw);
router.post("/delete", accountsController.del);
router.post("/transfer", accountsController.transfer);
router.get("/private", accountsController.private);
module.exports = router;
