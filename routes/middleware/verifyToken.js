const jwt = require ('jsonwebtoken');

module.exports = function (req,res,next) {
    const token = req.header('authorization');
    if(!token) return res.status(401).send('Access Denied');
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        const role = verified.role;
        req.body.profile= verified;
        // if(role !== 'admin'){
        //     return res.status(403).send('Forbidden error');
        // }
        next();
    } catch (error) {
        res.status(400).send('Invalid Token');
    }
}