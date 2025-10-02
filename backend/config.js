module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'change_this_secret_for_prod',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/online_exam_proto',
  PORT: process.env.PORT || 4000
};
