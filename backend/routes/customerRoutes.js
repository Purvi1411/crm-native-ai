const express = require('express');
const router = express.Router();
const { getCustomers, seedCustomers, addCustomer, addCustomersBulk, clearCustomers } = require('../controllers/customerController');

router.get('/', getCustomers);
router.post('/seed', seedCustomers);
router.post('/', addCustomer);
router.post('/bulk', addCustomersBulk);
router.delete('/clear', clearCustomers);

module.exports = router;