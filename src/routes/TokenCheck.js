const { Router } = require('express');
const { User } = require('../db');
const router = Router();
const JWT = require("jsonwebtoken");
const authToken = require("./middleware/authenticateToken");



router.get('/tokenCheck', authToken, async (req,res)=>{
  return res.status(200).send(true);
});
   
router.get('/tokenRefresh', authToken, async (req,res)=>{
  
 try{
  const user = await User.findOne({
    where: {
      userName: req.user
    }
  })
  

  const accessToken = await JWT.sign(
    { userName: user.userName,
      role: user.role },
    'ACCESS_TOKEN_SECRET',
    {
        expiresIn: "3600s",
    }
    );

    const refreshToken = await JWT.sign(
        { userName: user.userName,
          role: user.role },
        'ACCESS_TOKEN_SECRET',
        {
            expiresIn: "3900s",
        }
        );

    res.json({
    accessToken, 
    refreshToken,
    privileges: user.role,
    shippingAddress: user.defaultShippingAddress
    });
} catch (err) {
    res.send({error: err.message})
}
});


module.exports = router;