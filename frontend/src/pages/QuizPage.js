import React, { useEffect, useState, useRef } from 'react';
import { getJson, postJson } from '../api';

export default function QuizPage({ token, userId }){
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30*60); // 30 minutes default
  const videoRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const detectionFrameRef = useRef(null);

  useEffect(() => {
    async function loadQuiz(){
      const q = await getJson('/api/quiz', token);
      setQuiz(q);
      setAnswers(new Array(q.questions.length).fill(null));
    }
    loadQuiz();
  }, [token]);

  // Start media and detection
  async function startTest(){
    // Request camera and mic
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if(videoRef.current){ videoRef.current.srcObject = stream; videoRef.current.play().catch(()=>{}); }
      // setup ultrasonic emitter + receiver
      startUltrasonic(stream);
      setStarted(true);
      // start timer
      startTimer();
    } catch(err){
  console.error("Camera/mic error:", err);
  alert('Camera and microphone are required to start the test. (' + err.name + ')');
   }

  }

  function startTimer(){
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if(t <= 1){ clearInterval(interval); onSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
  }

  // Ultrasonic tone and detection (prototype)
  function startUltrasonic(stream){
    // AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;

    // Create oscillator for 19kHz
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    try { osc.frequency.setValueAtTime(19000, audioCtx.currentTime); } catch(e){ /* some browsers block high freq */ }
    const gain = audioCtx.createGain();
    gain.gain.value = 0.2; // low volume

    osc.connect(gain).connect(audioCtx.destination);
    osc.start();

    // Set up analyser to read mic input
    const mic = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 4096;
    mic.connect(analyser);
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);

    // detection loop
    function detect(){
      analyser.getByteFrequencyData(data);
      // calculate bin for ~19kHz
      const sampleRate = audioCtx.sampleRate;
      const binFreq = sampleRate / analyser.fftSize;
      const binIndex = Math.round(19000 / binFreq);
      const amplitude = data[binIndex] || 0;
      // threshold experimentally chosen — tune per device
      if(amplitude > 40){
        // send alert to server
        postJson('/api/alert', { type: 'ultrasonic', message: 'Possible phone detected (amp=' + amplitude + ')' }, token);
        // also show user alert
        console.warn('Possible phone detected — amplitude', amplitude);
      }
      detectionFrameRef.current = requestAnimationFrame(detect);
    }
    detect();
  }

  function chooseAnswer(i, optIdx){
    const copy = answers.slice();
    copy[i] = optIdx;
    setAnswers(copy);
    // autosave to localStorage (optional)
    localStorage.setItem('autosave_answers', JSON.stringify(copy));
  }

  async function onSubmit(){
    // stop detection
    if(detectionFrameRef.current) cancelAnimationFrame(detectionFrameRef.current);
    if(audioCtxRef.current) audioCtxRef.current.close().catch(()=>{});
    // submit
    const res = await postJson('/api/submit', { answers }, token);
    alert(`Test submitted. Score: ${res.score}/${res.total}`);
    // redirect or clear
    window.location.reload();
  }

  if(!quiz) return <div className="centered">Loading quiz…</div>;

  return (
    <div className="container">
      <div className="header">
        <h2>{quiz.title}</h2>
        <div className="timer">Time left: {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>
      </div>

      {!started ? (
        <div className="start-block">
          <p>Camera and microphone permission is mandatory. Click Start to allow.</p>
          <button onClick={startTest}>Start Test (Allow camera & mic)</button>
        </div>
      ) : (
        <div className="exam-area">
          <div className="left-col">
            <video ref={videoRef} width="320" height="240" autoPlay muted style={{border:'2px solid #666'}}/>
            <div className="actions">
              <button onClick={onSubmit}>Submit Test</button>
            </div>
          </div>

          <div className="questions">
            {quiz.questions.map((q, i) => (
              <div key={i} className="question-card">
                <p><strong>Q{i+1}.</strong> {q.q}</p>
                <ul>
                  {q.options.map((opt, idx) => (
                    <li key={idx}>
                      <label>
                        <input
                          type="radio"
                          name={'q'+i}
                          checked={answers[i] === idx}
                          onChange={() => chooseAnswer(i, idx)}
                        />
                        {' '}{opt}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
