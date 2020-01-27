const jwt = require('jsonwebtoken');
const configFile = require('./config');


module.exports = (req, resp, next)=>{
    try{
       // console.log("request",  req.headers.authorization);
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, configFile.jwtSecret);
        next();
    }catch(err){
      //  console.log('Authentication faild...');
        return resp.status(400).send({message : 'Authentication faild...'});
    }
}