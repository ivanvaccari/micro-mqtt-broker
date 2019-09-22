const crypto = require('crypto');

module.exports = function(str){
    return crypto.createHash('sha256')
        .update(str)
        .digest('base64')
        .replace("/","")
        .replace("+","")
        .replace("=","")
        .substring(0,5);
}