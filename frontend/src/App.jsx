
import { useState } from "react";
import "./App.css";

const starterQuizzes = [
  {
    id: 1,
    title: "General Knowledge",
    category: "Education",
    questions: [
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Jupiter", "Venus"],
        answer: 1,
      },
      {
        question: "How many days are there in a leap year?",
        options: ["365", "366", "364", "360"],
        answer: 1,
      },
      {
        question: "Which is the largest ocean?",
        options: ["Indian", "Atlantic", "Pacific", "Arctic"],
        answer: 2,
      },
    ],
  },
  {
    id: 2,
    title: "Computer Basics",
    category: "Technology",
    questions: [
      {
        question: "What does CPU stand for?",
        options: [
          "Central Processing Unit",
          "Computer Personal Unit",
          "Central Program Utility",
          "Control Processing User",
        ],
        answer: 0,
      },
      {
        question: "Which language runs in a web browser?",
        options: ["C", "JavaScript", "SQL", "Assembly"],
        answer: 1,
      },
    ],
  },
];

function App() {
  const [users, setUsers] = useState(() =>
    JSON.parse(localStorage.getItem("qbUsers") || "[]")
  );
  const [currentUser, setCurrentUser] = useState(() =>
    JSON.parse(localStorage.getItem("qbCurrentUser") || "null")
  );
  const [quizzes, setQuizzes] = useState(() =>
    JSON.parse(localStorage.getItem("qbQuizzes") || "null") ||
    starterQuizzes
  );
  const [attempts, setAttempts] = useState(() =>
    JSON.parse(localStorage.getItem("qbAttempts") || "[]")
  );
  const [page, setPage] = useState("home");
  const [authMode, setAuthMode] = useState("login");
  const [notice, setNotice] = useState("");
  const [auth, setAuth] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [quizTitle, setQuizTitle] = useState("");
  const [quizCategory, setQuizCategory] = useState("General");
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("mcq");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("0");
  const [draftQuestions, setDraftQuestions] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reportQuiz, setReportQuiz] = useState(null);

  function saveUsers(next) {
    setUsers(next);
    localStorage.setItem("qbUsers", JSON.stringify(next));
  }

  function saveQuizzes(next) {
    setQuizzes(next);
    localStorage.setItem("qbQuizzes", JSON.stringify(next));
  }

  function saveAttempts(next) {
    setAttempts(next);
    localStorage.setItem("qbAttempts", JSON.stringify(next));
  }

  function openAuth(mode) {
    setAuthMode(mode);
    setNotice("");
    setAuth({ name: "", email: "", password: "", role: "user" });
    setPage("auth");
  }

  function handleAuth(event) {
    event.preventDefault();
    setNotice("");

    const email = auth.email.trim().toLowerCase();

    if (authMode === "signup") {
      if (!auth.name.trim() || !email || !auth.password) {
        setNotice("Please complete every field.");
        return;
      }

      if (auth.password.length < 6) {
        setNotice("Password must contain at least 6 characters.");
        return;
      }

      if (users.some((user) => user.email === email)) {
        setNotice("An account with this email already exists.");
        return;
      }

      const newUser = {
        id: Date.now(),
        name: auth.name.trim(),
        email,
        password: auth.password,
        role: "user",
      };

      saveUsers([...users, newUser]);
      setCurrentUser(newUser);
      localStorage.setItem("qbCurrentUser", JSON.stringify(newUser));
      setPage("user");
      setNotice("Account created successfully!");
      return;
    }

    const found = users.find(
      (user) => user.email === email && user.password === auth.password
    );

    if (found) {
      setCurrentUser(found);
      localStorage.setItem("qbCurrentUser", JSON.stringify(found));
      setPage(found.role === "admin" ? "admin" : "user");
      setNotice("");
    } else if (email === "admin@quizbuilder.com" && auth.password === "Admin123!") {
      const admin = {
        id: "admin",
        name: "Administrator",
        email,
        role: "admin",
      };
      setCurrentUser(admin);
      localStorage.setItem("qbCurrentUser", JSON.stringify(admin));
      setPage("admin");
      setNotice("");
    } else {
      setNotice("Invalid login details. Please sign up or try again.");
    }
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem("qbCurrentUser");
    setPage("home");
    setNotice("You have logged out.");
  }

  function addDraftQuestion(event) {
    event.preventDefault();

    if (!questionText.trim()) {
      setNotice("Enter a question first.");
      return;
    }

    if (questionType === "mcq" && options.some((option) => !option.trim())) {
      setNotice("Fill in all four answer options.");
      return;
    }

    const question = {
      question: questionText.trim(),
      type: questionType,
      options: questionType === "mcq" ? [...options] : [],
      answer:
        questionType === "mcq"
          ? Number(correctAnswer)
          : questionType === "truefalse"
            ? correctAnswer === "true"
            : null,
    };

    setDraftQuestions([...draftQuestions, question]);
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer("0");
    setNotice("Question added to your draft.");
  }

  function publishQuiz(event) {
    event.preventDefault();

    if (!quizTitle.trim() || draftQuestions.length === 0) {
      setNotice("Enter a quiz title and add at least one question.");
      return;
    }

    const quiz = {
      id: Date.now(),
      title: quizTitle.trim(),
      category: quizCategory,
      questions: [...draftQuestions],
      createdBy: currentUser?.email,
    };

    saveQuizzes([...quizzes, quiz]);
    setQuizTitle("");
    setDraftQuestions([]);
    setNotice("Quiz created successfully!");
    setPage("admin");
  }

  function startQuiz(quiz) {
    setActiveQuiz(quiz);
    setQuestionIndex(0);
    setAnswers({});
    setNotice("");
    setPage("play");
  }

  function submitQuiz() {
    const score = activeQuiz.questions.reduce((total, question, index) => {
      const selected = answers[index];

      if (question.type === "mcq") {
        return total + (selected === question.answer ? 1 : 0);
      }

      if (question.type === "truefalse") {
        return total + (selected === question.answer ? 1 : 0);
      }

      return total;
    }, 0);

    const attempt = {
      id: Date.now(),
      quizId: activeQuiz.id,
      quizTitle: activeQuiz.title,
      userEmail: currentUser.email,
      score,
      total: activeQuiz.questions.filter(
        (question) => question.type !== "open"
      ).length,
      date: new Date().toISOString(),
      answers: { ...answers },
    };

    saveAttempts([...attempts, attempt]);
    setReportQuiz(attempt);
    setPage("result");
  }

  function shuffleQuestions(quiz) {
    const shuffled = [...quiz.questions].sort(() => Math.random() - 0.5);
    startQuiz({ ...quiz, questions: shuffled });
  }

  function navLink(target, label) {
    return (
      <button className="nav-link" onClick={() => setPage(target)}>
        {label}
      </button>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setPage("home")}>
          <span className="brand-icon">Q</span>
          <span>Quiz<span className="brand-accent">Builder</span></span>
        </button>

        <nav className="navigation">
          {navLink("home", "Home")}
          {currentUser && navLink(
            currentUser.role === "admin" ? "admin" : "user",
            "Dashboard"
          )}
          {!currentUser ? (
            <>
              <button className="nav-link" onClick={() => openAuth("login")}>
                Log in
              </button>
              <button className="primary-button nav-cta" onClick={() => openAuth("signup")}>
                Get Started
              </button>
            </>
          ) : (
            <button className="nav-link" onClick={logout}>Log out</button>
          )}
        </nav>
      </header>

      {notice && (
        <div className="notice" role="status">
          {notice}
          <button onClick={() => setNotice("")}>×</button>
        </div>
      )}

      {page === "home" && (
        <main>
          <section className="hero">
            <div className="hero-content">
              <span className="eyebrow">LEARN · PLAY · GROW</span>
              <h1>Knowledge becomes powerful when you <span>put it to the test.</span></h1>
              <p>
                Create interactive quizzes, challenge your knowledge, and
                track your progress with one simple platform.
              </p>
              <div className="hero-actions">
                <button className="primary-button" onClick={() => openAuth("signup")}>
                  Create Free Account →
                </button>
                <button className="secondary-button" onClick={() => setPage("explore")}>
                  Explore Quizzes
                </button>
              </div>
              <div className="hero-trust">
                <span>✓ Multiple question types</span>
                <span>✓ Instant results</span>
                <span>✓ Progress tracking</span>
              </div>
            </div>
            <div className="hero-art">
              <div className="art-glow"></div>
              <div className="quiz-preview">
                <div className="preview-top">
                  <span className="live-dot"></span> QUICK CHALLENGE
                  <span className="preview-count">01 / 05</span>
                </div>
                <h3>Which planet is known as the Red Planet?</h3>
                {["Earth", "Mars", "Jupiter", "Venus"].map((option, index) => (
                  <div className={`preview-option ${index === 1 ? "correct" : ""}`} key={option}>
                    <span>{String.fromCharCode(65 + index)}</span>{option}
                    {index === 1 && <b>✓</b>}
                  </div>
                ))}
                <div className="preview-progress"><span></span></div>
                <div className="preview-footer"><span>Great progress!</span><strong>+20 points</strong></div>
              </div>
              <div className="floating-score">🏆 <span><b>Top score</b><br/>980 points</span></div>
              <div className="floating-users">👥 2.4k+ learners</div>
            </div>
          </section>

          <section className="feature-section">
            <div className="section-heading">
              <span className="eyebrow">ONE PLATFORM, MANY POSSIBILITIES</span>
              <h2>Everything you need to make learning engaging</h2>
              <p>Tools for creators, learners, and everyone in between.</p>
            </div>
            <div className="feature-grid">
              {[
                ["✦", "Create your way", "Build multiple-choice, true/false, and open-ended quizzes."],
                ["↗", "Learn by doing", "Answer interactive questions and get immediate feedback."],
                ["◷", "Track your progress", "Review attempts and monitor your quiz scores."],
                ["▤", "Useful reports", "Review quiz participation and results in your dashboard."],
              ].map(([icon, title, description]) => (
                <article className="feature-card" key={title}>
                  <span className="feature-icon">{icon}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </section>
        </main>
      )}

      {page === "auth" && (
        <main className="auth-layout">
          <section className="auth-intro">
            <span className="eyebrow">WELCOME TO QUIZBUILDER</span>
            <h1>Your next big idea starts with a question.</h1>
            <p>Join learners and creators building better knowledge, one quiz at a time.</p>
            <div className="auth-benefit">✓ Your quiz history in one place</div>
            <div className="auth-benefit">✓ Create and share quizzes</div>
            <div className="auth-benefit">✓ Follow your progress</div>
          </section>
          <form className="auth-card" onSubmit={handleAuth}>
            <h2>{authMode === "signup" ? "Create your account" : "Welcome back"}</h2>
            <p>{authMode === "signup" ? "Start learning and creating today." : "Log in to continue to your dashboard."}</p>
            {authMode === "signup" && (
              <label>Full name
                <input required value={auth.name} onChange={(e) => setAuth({...auth, name: e.target.value})} placeholder="Your full name" />
              </label>
            )}
            <label>Email address
              <input required type="email" value={auth.email} onChange={(e) => setAuth({...auth, email: e.target.value})} placeholder="you@example.com" />
            </label>
            <label>Password
              <input required type="password" minLength="6" value={auth.password} onChange={(e) => setAuth({...auth, password: e.target.value})} placeholder="At least 6 characters" />
            </label>
            <button className="primary-button full-button" type="submit">
              {authMode === "signup" ? "Create Account" : "Log In"} →
            </button>
            <div className="auth-switch">
              {authMode === "signup" ? "Already have an account?" : "New to QuizBuilder?"}
              <button type="button" onClick={() => openAuth(authMode === "signup" ? "login" : "signup")}>
                {authMode === "signup" ? "Log in" : "Create account"}
              </button>
            </div>
            <div className="admin-hint">
              Admin demo: <b>admin@quizbuilder.com</b><br/>
              Password: <b>Admin123!</b>
            </div>
          </form>
        </main>
      )}

      {page === "explore" && (
        <main className="dashboard">
          <div className="page-heading">
            <div><span className="eyebrow">QUIZ LIBRARY</span><h1>Explore quizzes</h1>
              <p>Choose a challenge and test what you know.</p></div>
            <button className="secondary-button" onClick={() => setPage("home")}>← Home</button>
          </div>
          <div className="quiz-grid">
            {quizzes.map((quiz) => (
              <article className="quiz-card" key={quiz.id}>
                <span className="quiz-category">{quiz.category}</span>
                <h3>{quiz.title}</h3>
                <p>{quiz.questions.length} questions · Interactive quiz</p>
                <button className="primary-button" onClick={() => currentUser ? startQuiz(quiz) : openAuth("login")}>
                  Take Quiz →
                </button>
              </article>
            ))}
          </div>
        </main>
      )}

      {page === "user" && currentUser && (
        <main className="dashboard">
          <div className="page-heading">
            <div><span className="eyebrow">LEARNER SPACE</span><h1>Welcome, {currentUser.name}</h1>
              <p>Your next challenge is waiting.</p></div>
            <button className="primary-button" onClick={() => setPage("explore")}>Explore Quizzes →</button>
          </div>
          <div className="stats-grid">
            <article className="stat-card"><span>Available quizzes</span><strong>{quizzes.length}</strong></article>
            <article className="stat-card"><span>Quizzes completed</span><strong>{attempts.filter((a) => a.userEmail === currentUser.email).length}</strong></article>
            <article className="stat-card"><span>Total points</span><strong>{attempts.filter((a) => a.userEmail === currentUser.email).reduce((sum, a) => sum + a.score, 0)}</strong></article>
          </div>
          <div className="section-row"><h2>Available quizzes</h2><button className="text-button" onClick={() => setPage("explore")}>View all →</button></div>
          <div className="quiz-grid">
            {quizzes.map((quiz) => (
              <article className="quiz-card" key={quiz.id}>
                <span className="quiz-category">{quiz.category}</span><h3>{quiz.title}</h3>
                <p>{quiz.questions.length} questions</p>
                <button className="primary-button" onClick={() => shuffleQuestions(quiz)}>Start quiz →</button>
              </article>
            ))}
          </div>
          <div className="section-row"><h2>Recent attempts</h2></div>
          <div className="panel">
            {attempts.filter((a) => a.userEmail === currentUser.email).length === 0 ? (
              <p className="empty-state">No attempts yet. Take a quiz to see your results here.</p>
            ) : attempts.filter((a) => a.userEmail === currentUser.email).map((attempt) => (
              <div className="attempt-row" key={attempt.id}>
                <div><b>{attempt.quizTitle}</b><small>{new Date(attempt.date).toLocaleString()}</small></div>
                <strong>{attempt.score}/{attempt.total}</strong>
              </div>
            ))}
          </div>
        </main>
      )}

      {page === "admin" && currentUser?.role === "admin" && (
        <main className="dashboard">
          <div className="page-heading">
            <div><span className="eyebrow">CONTROL CENTER</span><h1>Admin dashboard</h1>
              <p>Create quizzes, manage your content, and review participation.</p></div>
            <button className="primary-button" onClick={() => {setPage("create");setNotice("");}}>+ Create Quiz</button>
          </div>
          <div className="stats-grid">
            <article className="stat-card"><span>Total quizzes</span><strong>{quizzes.length}</strong></article>
            <article className="stat-card"><span>Registered users</span><strong>{users.length}</strong></article>
            <article className="stat-card"><span>Total attempts</span><strong>{attempts.length}</strong></article>
          </div>
          <div className="section-row"><h2>Manage quizzes</h2></div>
          <div className="panel">
            {quizzes.map((quiz) => (
              <div className="manage-row" key={quiz.id}>
                <div><b>{quiz.title}</b><small>{quiz.category} · {quiz.questions.length} questions</small></div>
                <div className="manage-actions">
                  <button className="secondary-button small-button" onClick={() => {setReportQuiz(quiz);setPage("reports");}}>Reports</button>
                  <button className="danger-button" onClick={() => {
                    if (window.confirm(`Delete "${quiz.title}"?`)) saveQuizzes(quizzes.filter((q) => q.id !== quiz.id));
                  }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {page === "create" && currentUser?.role === "admin" && (
        <main className="dashboard create-layout">
          <div className="page-heading"><div><span className="eyebrow">QUIZ STUDIO</span><h1>Create a quiz</h1><p>Build a quiz by adding questions below.</p></div>
            <button className="secondary-button" onClick={() => setPage("admin")}>← Dashboard</button></div>
          <form className="panel create-panel" onSubmit={publishQuiz}>
            <label>Quiz title<input required value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="e.g. JavaScript Fundamentals"/></label>
            <label>Category<select value={quizCategory} onChange={(e) => setQuizCategory(e.target.value)}><option>General</option><option>Education</option><option>Technology</option><option>Science</option><option>Entertainment</option><option>Training</option></select></label>
            <div className="section-row"><h2>Add a question</h2><span className="quiz-category">{draftQuestions.length} added</span></div>
            <label>Question type<select value={questionType} onChange={(e) => {setQuestionType(e.target.value);setCorrectAnswer("0");}}><option value="mcq">Multiple choice</option><option value="truefalse">True / False</option><option value="open">Open-ended</option></select></label>
            <form className="question-form" onSubmit={addDraftQuestion}>
              <label>Question text<textarea required value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="Enter your question..." rows="3"/></label>
              {questionType === "mcq" && (
                <div className="options-editor">
                  {options.map((option, index) => <label key={index}>Option {String.fromCharCode(65 + index)}
                    <input value={option} onChange={(e) => setOptions(options.map((value, i) => i === index ? e.target.value : value))} placeholder={`Answer option ${index + 1}`}/>
                  </label>)}
                  <label>Correct answer<select value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)}>{options.map((option, index) => <option key={index} value={index}>{String.fromCharCode(65 + index)} {option || `Option ${index + 1}`}</option>)}</select></label>
                </div>
              )}
              {questionType === "truefalse" && <label>Correct answer<select value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)}><option value="true">True</option><option value="false">False</option></select></label>}
              {questionType === "open" && <p className="helper-text">Open-ended responses are collected but aren't automatically scored.</p>}
              <button className="secondary-button" type="submit">+ Add question</button>
            </form>
            {draftQuestions.length > 0 && <div className="draft-list">{draftQuestions.map((q, i) => <div key={i} className="draft-item"><span>{i + 1}. {q.question}</span><button type="button" onClick={() => setDraftQuestions(draftQuestions.filter((_, index) => index !== i))}>Remove</button></div>)}</div>}
            <button className="primary-button full-button" type="submit">Publish Quiz →</button>
          </form>
        </main>
      )}

      {page === "play" && activeQuiz && (
        <main className="play-layout">
          <div className="play-top"><span className="quiz-category">{activeQuiz.category}</span><button className="text-button" onClick={() => setPage("user")}>Exit quiz ×</button></div>
          <div className="play-card">
            <div className="play-progress"><span style={{width: `${((questionIndex + 1) / activeQuiz.questions.length) * 100}%`}}/></div>
            <p className="eyebrow">QUESTION {questionIndex + 1} OF {activeQuiz.questions.length}</p>
            <h1>{activeQuiz.questions[questionIndex].question}</h1>
            {activeQuiz.questions[questionIndex].type === "open" ? (
              <textarea rows="5" value={answers[questionIndex] || ""} onChange={(e) => setAnswers({...answers, [questionIndex]: e.target.value})} placeholder="Write your answer..."/>
            ) : (activeQuiz.questions[questionIndex].type === "truefalse" ? [true, false] : activeQuiz.questions[questionIndex].options).map((option, index) => (
              <button key={String(option)} className={`answer-option ${answers[questionIndex] === (activeQuiz.questions[questionIndex].type === "truefalse" ? option : index) ? "selected" : ""}`} onClick={() => setAnswers({...answers, [questionIndex]: activeQuiz.questions[questionIndex].type === "truefalse" ? option : index})}>
                <span>{activeQuiz.questions[questionIndex].type === "truefalse" ? (option ? "T" : "F") : String.fromCharCode(65 + index)}</span>
                {activeQuiz.questions[questionIndex].type === "truefalse" ? (option ? "True" : "False") : option}
              </button>
            ))}
            <div className="play-controls">
              <button className="secondary-button" disabled={questionIndex === 0} onClick={() => setQuestionIndex(questionIndex - 1)}>← Previous</button>
              {questionIndex < activeQuiz.questions.length - 1 ? (
                <button className="primary-button" onClick={() => setQuestionIndex(questionIndex + 1)}>Next question →</button>
              ) : (
                <button className="primary-button" onClick={submitQuiz}>Submit quiz ✓</button>
              )}
            </div>
          </div>
        </main>
      )}

      {page === "result" && reportQuiz && (
        <main className="result-layout">
          <div className="result-card">
            <div className="result-icon">✓</div><span className="eyebrow">QUIZ COMPLETED</span>
            <h1>Nice work, {currentUser?.name}!</h1><p>You completed <b>{reportQuiz.quizTitle}</b>.</p>
            <div className="score-circle"><strong>{reportQuiz.score}</strong><span>out of {reportQuiz.total}</span></div>
            <p className="result-message">{reportQuiz.total ? Math.round(reportQuiz.score / reportQuiz.total * 100) : 0}% score</p>
            <button className="primary-button full-button" onClick={() => setPage("user")}>Back to dashboard</button>
            <button className="secondary-button full-button" onClick={() => setPage("explore")}>Try another quiz</button>
          </div>
        </main>
      )}

      {page === "reports" && currentUser?.role === "admin" && (
        <main className="dashboard">
          <div className="page-heading"><div><span className="eyebrow">ANALYTICS</span><h1>Quiz reports</h1><p>Review participation and scores.</p></div>
            <button className="secondary-button" onClick={() => setPage("admin")}>← Dashboard</button></div>
          <div className="stats-grid">
            <article className="stat-card"><span>Quiz</span><strong className="stat-label">{reportQuiz?.title || reportQuiz?.quizTitle || "All quizzes"}</strong></article>
            <article className="stat-card"><span>Attempts</span><strong>{attempts.filter((a) => !reportQuiz?.id || a.quizId === reportQuiz.id).length}</strong></article>
            <article className="stat-card"><span>Participants</span><strong>{new Set(attempts.filter((a) => !reportQuiz?.id || a.quizId === reportQuiz.id).map((a) => a.userEmail)).size}</strong></article>
          </div>
          <div className="panel">
            {attempts.filter((a) => !reportQuiz?.id || a.quizId === reportQuiz.id).map((attempt) => <div className="attempt-row" key={attempt.id}><div><b>{attempt.quizTitle}</b><small>{attempt.userEmail} · {new Date(attempt.date).toLocaleString()}</small></div><strong>{attempt.score}/{attempt.total}</strong></div>)}
            {attempts.length === 0 && <p className="empty-state">No quiz attempts have been recorded yet.</p>}
          </div>
        </main>
      )}

      <footer className="footer">
        <button className="brand footer-brand" onClick={() => setPage("home")}><span className="brand-icon">Q</span> QuizBuilder</button>
        <span>Make every question count.</span>
        <span>© 2026 QuizBuilder</span>
      </footer>
    </div>
  );
}

export default App;
