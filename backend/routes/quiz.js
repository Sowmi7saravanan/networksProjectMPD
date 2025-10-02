const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Quiz = require('../models/Quiz');
const Alert = require('../models/Alert');
const { JWT_SECRET } = require('../config');

async function authMiddleware(req, res, next) {
  // 👇 Debug log to check if token is being sent
  console.log("Authorization header:", req.headers['authorization']);

  const auth = req.headers['authorization'];
  if (!auth) {
    return res.status(401).json({ error: 'No token' });
  }

  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (e) {
    console.error("JWT error:", e.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// get quiz (one quiz prototype)
router.get('/quiz', authMiddleware, async (req, res) => {
  try {
    let quiz = await Quiz.findOne();
    if (!quiz) {
      quiz = await Quiz.create({
        title: 'Sample MCQ Test',
        questions: [
          { q: 'HTML stands for?', options: ['Hyper Text Markup Language','Home Tool Markup','Hyperlinks Text Marked'], answerIndex: 0 },
          { q: 'CSS is used for?', options: ['Structure','Styling','Database'], answerIndex: 1 },
          { q: 'JS is', options: ['Programming language','Database','Protocol'], answerIndex: 0 }
        ]
      });
    }
    const safe = { _id: quiz._id, title: quiz.title, questions: quiz.questions.map(x => ({ q: x.q, options: x.options })) };
    res.json(safe);
  } catch (err) {
    console.error('Error in GET /quiz:', err.message);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// submit answers
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findOne();
    if (!quiz) return res.status(400).json({ error: 'No quiz' });

    let score = 0;
    for (let i = 0; i < quiz.questions.length; i++) {
      if (typeof answers[i] === 'number' && answers[i] === quiz.questions[i].answerIndex) {
        score++;
      }
    }
    res.json({ score, total: quiz.questions.length });
  } catch (err) {
    console.error('Error in POST /submit:', err.message);
    res.status(500).json({ error: 'Failed to submit answers' });
  }
});

// receive alert logs
router.post('/alert', authMiddleware, async (req, res) => {
  try {
    const { type, message } = req.body;
    await Alert.create({ userId: req.userId, type, message });
    res.json({ ok: true });
  } catch (err) {
    console.error('Error in POST /alert:', err.message);
    res.status(500).json({ error: 'Could not save alert' });
  }
});

module.exports = router;
