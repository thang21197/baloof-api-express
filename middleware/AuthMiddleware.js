const jwtHelper = require('../helpers/jwt.helper');

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "access-token-secret-example-trungquandev.com-green-cat-a@";

/**
 * Middleware: Authorization user by Token
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */


let isAuth = async (req, res , next ) =>{
    const tokenFromClient = req.body.token || req.query.token || req.headers["authorization"];
    if (tokenFromClient) {
        // IF isset Token
        try{
            //  Verify Token
            const decoded = await jwtHelper.verifyToken(tokenFromClient,accessTokenSecret);
            req.body.jwtDecoded = decoded;
            // res.send(req);
            next();
        }catch(error){
            return res.status(401).json({
                message: 'Unauthorized.',
            });
        }
    }
    else{
        return res.status(403).send({
            message: 'No token provided.',
        });
    }
}

let isAdmin = async (req, res , next) => {
    const tokenFromClient = req.body.token || req.query.token || req.headers["authorization"];
    if (tokenFromClient) {
        // IF isset Token
        try{
            const decoded = await jwtHelper.verifyToken(tokenFromClient,accessTokenSecret);
            if(decoded.data.role == "admin"){
                next();
            }
            else{
                return res.status(401).json({
                    message: 'Access forbidden.',
                });
            }
        }catch(error){
            return res.status(401).json({
                message: 'Unauthorized.',
            });
        }
    }
    else{
        return res.status(403).send({
            message: 'No token provided.',
        });
    }
}

module.exports = {
    isAuth: isAuth,
    isAdmin:isAdmin
  };