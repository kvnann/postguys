var environments = {};

environments.staging = {
  'httpPort' : 3001,
  'httpsPort' : 3002,
  'baseUrl':'https://postguys.vercel.app',
  'envName' : 'staging',
  'hashingSecret' : 'HKLDFHJSKLDHFKFDHSF',
  'tokenkey':'GHJDSFGDFHJSDASGJKH67892345DFSGKJH',
  'maxChecks' : 5,
  'templateGlobals' : {

  },
  "dbUrl" : "mongodb+srv://kanan:kenan2004@cluster0.2ktgvek.mongodb.net/?retryWrites=true&w=majority",
  "dbName" : "messageapp",
  'twilio' : {
    'accountSid' : 'ACd818492b04c6942abc56e61dea690899',
    'authToken' : '14765347087ea272f520afa2639d36ea',
    'fromPhone' : '+15304530993'
  }
};

environments.production = {
  'httpPort' : 5001,
  'httpsPort' : 5002,
  'baseUrl':'https://postguys.vercel.app',
  'envName' : 'production',
  'hashingSecret' : 'HKLDFHJSKLDHFKFDHSF',
  'tokenkey':'GHJDSFGDFHJSDASGJKH67892345DFSGKJH',
  'maxChecks' : 10,
  'templateGlobals' : {

  },
  "dbUrl" : "mongodb+srv://kanan:kenan2004@cluster0.2ktgvek.mongodb.net/?retryWrites=true&w=majority",
  "dbName" : "messageapp",
  'twilio' : {
    'accountSid' : 'ACd818492b04c6942abc56e61dea690899',
    'authToken' : '14765347087ea272f520afa2639d36ea',
    'fromPhone' : '+15304530993'
  }
};

var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;
