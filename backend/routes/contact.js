// // routes/contact.js
// const express = require('express');
// const router = express.Router();
// const { sendMessage } = require('../controllers/contactController');
// router.post('/', sendMessage);
// module.exports = router;


// const express = require('express');
// const router = express.Router();

// router.post('/', async (req, res) => {
//   try {
//     const { sendMessage } = require('../controllers/contactController');
//     await sendMessage(req, res);
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Contact form error.' });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const { sendMessage } = require('../controllers/contactController');

router.post('/', sendMessage);

module.exports = router;