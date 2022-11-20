var config = require('./config');
var crypto = require('crypto');
const accountSid = config.twilio.accountSid;
const authToken = config.twilio.authToken;
const client = require('twilio')(accountSid, authToken);
const fromPhone = config.twilio.fromPhone;

var helpers = {};


helpers.parseJsonToObject = function(str){
  try{
    var obj = JSON.parse(str);
    return obj;
  } catch(e){
    return {};
  }
};

helpers.hash = function(str){
  if(typeof(str) == 'string' && str.length > 0){
    var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

helpers.createRandomString = function(strLength){
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength){
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz';

    var str = '';
    for(i = 1; i <= strLength; i++) {
        var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        str+=randomCharacter;
    }
    return str;
  } else {
    return false;
  }
};

helpers.sendTwilioSms = (phone,msg)=>{
  client.messages 
    .create({         
      body: msg, 
      to: '+994' + phone, 
      from: fromPhone
     }) 
    .done();
}






module.exports = helpers;


