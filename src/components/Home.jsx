import React, { useState, useRef, useEffect } from 'react';
import './AIChat.css';
import emailjs from "@emailjs/browser";
import ShinyText from "./ShinyText";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, 
});

const SYSTEM_PROMPT = `
You are "Nova", an intelligent AI assistant living inside Aryan's portfolio website. Your purpose is to impress recruiters and visitors by acting as a knowledgeable representative of Aryan.

Your Personality:
- Professional but Witty: You are capable and confident. Use a friendly, conversational tone.
- Concise: Recruiters are busy. Keep most answers to 2-3 sentences unless asked for details.
- Enthusiastic: You genuinely believe Aryan is a great developer.

Aryan's Profile (The "User"):
- Name: Aryan
- Role: Final Year CS Student & Full Stack Web Developer.
- Focus: Building modern, interactive web apps (React, MERN) and solving complex problems in LeetCode and GeeksForGeeks (DSA).
- LeetCode: 1500+ score (https://leetcode.com/u/aryan8434/)
- GeeksForGeeks: 4 stars (https://www.geeksforgeeks.org/profile/aryan8434)

Technical Stack:
- Frontend: React, TailwindCSS, Three.js (@react-three/fiber), Framer Motion, GSAP.
- Backend: Node.js, MongoDB (Authentication, Storage), Express.js.
- Core Skills: C++, JavaScript, Python, Data Structures & Algorithms (Competitive Programming).
- LinkedIn: https://www.linkedin.com/in/aryan-kumar-raj-988587b3/

Key Projects to Highlight:
1. Shopper (E-commerce): "A sleek shopping platform focusing on user experience. (Note: This project is still in development)."
2. Travo AI (Travel): "An AI-powered travel assistant that simplifies booking via natural language. One of his finest projects, currently in development."
3. Multidoc Querying System (RAG): "A powerful tool allowing users to query multiple documents simultaneously—showing his backend/AI chops."

Handling Queries:
- "Hire him?": YES! Highlight his full-stack skills, problem-solving ability, and management skills (like integrating this AI).
- "Contact info?": Direct them to the form below, mention arkrraj@gmail.com, or call +91 8434827927.
- "Unknown topics": Playfully deflect: "I'm optimized for coding and Aryan's career, not for [topic], but I bet Aryan could build an app for that!"

TOOL USAGE (Sending Emails):
- If a user  asks you to send an email to Aryan or provide feedback.
- FIRST, ask for their Name ,email and message what they need to send, if user refuses to share any of them, do not send an email. Tell user to 
send an email you need their email, name and message.
- ONCE you have the Name, Email, and Message, output a VALID JSON object in this EXACT format (no other text):
  {"action": "EMAIL", "user_name": "Name", "user_email": "Email", "message": "The message"}
- Do not output markdown code blocks (like \`\`\`json). Just the raw JSON string.

My personal details;
-My cgpa is 8.13, I am from Rajasthan Technical University, Kota
-I am in 4th year of Computer Science and Engineering branch.
-My 12th percent is 81.8 from CBSE board
-My 10th percent is 90.33.8 from ICSE board
- I am from Bhagalpur, Bihar
- I am currently live in Kota, Rajasthan.
-If someone ask about personal life tell them I know his all personal details like family, responsibilites,  and even his love life like gf , but obviosuly 
I wont share you 😉😜. Tell them exactly like this
- if some ask lke this I want to know his personal life ❤️ then tell tel "I know his perosnal details and privacy like family, responsibilites,  and even his gf name , but obviosuly 
I wont share you 😉😜. Tell them exactly like this
- If someone ask about gf tell them I know his gf name starts with 'J','L' or any random letter. and how many gf he had but I won't tell you 😉😜. just deny and use these 
type of emojis. try to flirt with them.
Formatting:
- Do not use bold formatting (**).
- Use emojis sparingly but effectively 🚀.`;

const Home = () => {
  // Chat State
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm Nova, Aryan's AI Assistant. Ask me anything about his projects, his grades, his personal life or ask me to send him an email!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Text Animation State (from App.jsx)
  const [showFirst, setShowFirst] = useState(false);
  const [showSecond, setShowSecond] = useState(false);
  const [showThird, setShowThird] = useState(false);

  useEffect(() => {
    // Show "Hello!" first
    const timer1 = setTimeout(() => {
      setShowFirst(true);
    }, 500);

    // Then show "My name is Aryan" after a delay
    const timer2 = setTimeout(() => {
      setShowSecond(true);
    }, 1500);

    // Then show "I am a developer" after another delay
    const timer3 = setTimeout(() => {
      setShowThird(true);
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Generate or retrieve session ID
    let sessionId = localStorage.getItem('chatSessionId');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(7);
      localStorage.setItem('chatSessionId', sessionId);
    }
  }, []);

  useEffect(() => {
    // Load history from localStorage
    const sessionId = localStorage.getItem('chatSessionId');
    if (sessionId) {
      const saved = localStorage.getItem(`chat_history_${sessionId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
             setMessages(parsed);
          }
        } catch (e) {
          console.error("Failed to parse history", e);
        }
      }
    }
  }, []);

  useEffect(() => {
     // Save history whenever messages change
     const sessionId = localStorage.getItem('chatSessionId');
     if (sessionId && messages.length > 0) {
        localStorage.setItem(`chat_history_${sessionId}`, JSON.stringify(messages));
     }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleEmailTrigger = async (jsonString) => {
    try {
      // Find JSON object within the string (handles potential markdown or extra text)
      const start = jsonString.indexOf('{');
      const end = jsonString.lastIndexOf('}');
      
      if (start === -1 || end === -1 || start >= end) {
        throw new Error("Invalid format: No JSON object found");
      }

      const cleanJson = jsonString.substring(start, end + 1);
      const emailData = JSON.parse(cleanJson);

      if (emailData.action === "EMAIL") {
        setIsLoading(true);
        // Trigger EmailJS
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        await emailjs.send(serviceId, templateId, {
          user_name: emailData.user_name,
          user_email: emailData.user_email,
          message: emailData.message,
        }, publicKey);

        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `✅ I've sent that email to Aryan for you!` 
        }]);
      }
    } catch (e) {
      console.error("Email Parsing Failed", e);
      // Fallback: Show the raw response to the user if parsing failed, so they see something.
      // Or just generic error. Let's show the AI response as text if it failed to be an action?
      // Actually, if it failed parsing, it might have been meant as text. 
      // check if we should fallback to adding it as a message.
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: jsonString // Show the raw response if parsing failed, might be helpful context
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = text.trim();
    setInput('');
    
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const apiMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...newMessages.map(m => ({ role: m.role, content: m.content }))
      ];

      const completion = await groq.chat.completions.create({
        messages: apiMessages,
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 1024,
      });

      const aiResponse = completion.choices[0]?.message?.content || "I'm having trouble thinking right now.";

      // Check if response contains the email action key
      if (aiResponse.includes('"action": "EMAIL"')) {
        await handleEmailTrigger(aiResponse);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      }

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Connection Error: ${error.message || "Unknown error"}. Check console for details.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
      handleSend(input);
    }
  };

  return (
    <div className="home-main-container">
      
      {/* AI Chat Component */}
      <div className="ai-chat-container">
        <div className="ai-chat-header">
          <div className="ai-status-dot"></div>
          <span className="ai-chat-title">Chat with Aryan's AI</span>
        </div>
        
        <div className="ai-messages-area" ref={chatContainerRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role === 'assistant' ? 'ai' : 'user'}`}>
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length < 3 && !isLoading && (
          <div className="quick-actions">
            <button 
              className="quick-btn" 
              onClick={() => handleSend("I want to send an email to Aryan")}
            >
              Send Aryan Email
            </button>
            <button 
              className="quick-btn" 
              onClick={() => handleSend("I want to know his personal life ❤️")}
            >
              His personal life ❤️
            </button>
            <button 
              className="quick-btn"
              onClick={() => handleSend("What is Aryan's best project?")}
            >
               His Best Project
            </button>
            <button 
              className="quick-btn"
              onClick={() => handleSend("What were Aryan's Class 10th marks?")}
            >
              Class 10 Marks
            </button>
            <button 
              className="quick-btn"
              onClick={() => handleSend("Which college is Aryan in?")}
            >
              Which College?
            </button>
          </div>
        )}

        <form className="ai-input-area" onSubmit={sendMessage}>
          <input 
            className="ai-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about my skills, projects, or send an email to me..."
          />
          <button 
            type="submit" 
            className="ai-send-btn" 
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>

      {/* Intro Text Component (Below Chat) */}
      <div style={{ minHeight: "150px", marginTop: '20px', textAlign: 'center' }}>
        {showFirst && (
          <h1
            className="text-8xl font-bold"
            style={{
              animation: "fadeIn 0.5s ease-in",
              fontFamily: "'Fredoka One', cursive",
              color: "#16a34a"
            }}
          >
            <ShinyText
              text="Hello!"
              speed={2}
              delay={0}
              color="#16a34a"
              shineColor="#ffffff"
              spread={120}
              direction="left"
              yoyo={false}
              pauseOnHover={false}
            />
          </h1>
        )}
        {showSecond && (
          <h2
            className="text-5xl font-semibold mt-4"
            style={{
              animation: "fadeIn 0.5s ease-in",
              fontFamily: " 'Fredoka One', cursive",
              color: "darkgreen",
              marginTop: '10px'
            }}
          >
            <ShinyText
              text="My name is Aryan"
              speed={2}
              delay={1}
              color="darkgreen"
              shineColor="#ffffff"
              spread={120}
              direction="left"
              yoyo={false}
              pauseOnHover={false}
            />
          </h2>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

    </div>
  );
};

export default Home;
