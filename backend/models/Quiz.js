const mongoose = require('../db');
const QuizSchema = new mongoose.Schema({
  title: String,
  questions: [
    {
      q: String,
      options: [String],
      answerIndex: Number // correct index (used on server evaluation)
    }
  ]
});
module.exports = mongoose.model('Quiz', QuizSchema);
