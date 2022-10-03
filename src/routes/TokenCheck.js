const { Router } = require('express');
const router = Router();
const authToken = require("./middleware/authenticateToken");



router.get('/tokenCheck', authToken, async (req,res)=>{
  return res.status(200).send(true);
});
    

module.exports = router;