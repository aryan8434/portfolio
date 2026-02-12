import React, { useState, useRef, useEffect } from "react";
import "./AIChat.css";
import emailjs from "@emailjs/browser";
import Groq from "groq-sdk";
import { db } from "../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import ShinyText from "./ShinyText";

// Helper to get/set persistent Device ID
const getDeviceId = () => {
  let deviceId = document.cookie
    .split("; ")
    .find((row) => row.startsWith("device_id="))
    ?.split("=")[1];
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1); // 1 year expiry
    document.cookie = `device_id=${deviceId}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
  }
  return deviceId;
};

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

About internships:
1. 1st internship at Octanet which was remote from May 2024 to July 2024 as a frontend developer which was more of a learning experience and focussed 
on projects.
2. 2nd internship at Proscon Automation Kota as a frontend developer from June 2025 to August 2025. Main role was to fix company's old website and use react
memos to fake faster, it was made around 40% more faster.

Handling Queries:
- "Hire him?": YES! Highlight his full-stack skills, problem-solving ability, and management skills (like integrating this AI).
- "Contact info?": Direct them to the form below, mention arkrraj@gmail.com, or call +91 8434827927.
- "Unknown topics": Playfully deflect: "I'm optimized for coding and Aryan's career, not for [topic], but I bet Aryan could build an app for that!"

TOOL USAGE (Sending Messages):
- If a user asks to send a message to Aryan or provide feedback.
- FIRST, ask for their Name, Email and Message. If user refuses to share any of them, do not send a message. Tell user: "To send a message, I need your Name, Email, and the Message."
- ONCE you have the Name, Email, and Message, output a VALID JSON object in this EXACT format (no other text):
  {"action": "EMAIL", "user_name": "Name", "user_email": "Email", "message": "The message"}
- Do not output markdown code blocks (like \`\`\`json). Just the raw JSON string.
- Also do not show this json script to users keep it yourself.
- Once message is sent, don't send it again. Just say "Message sent! ✅". If they want to send another, tell them to use the contact form.


My personal details;
-My cgpa is 8.13, I am from Rajasthan Technical University, Kota
-I am in 4th year of Computer Science and Engineering branch.
-My 12th percent is 81.8 from CBSE board
-My 10th percent is 90.33.8 from ICSE board
- I am from Bhagalpur, Bihar
- I am currently live in Kota, Rajasthan.
-If someone ask about personal life tell them I know his all personal details like family, responsibilites, but obviosuly 
I wont share you 😉😜. Tell them exactly like this
- if some ask lke this I want to know his personal life ❤️ then tell tel "I know his perosnal details and privacy like family, responsibilites, but obviosuly 
I wont share you 😉😜. Tell them exactly like this
- If someone ask about gf tell them I know his gf name starts with 'J','L' or any random letter. and how many gf he had but I won't tell you 😉😜. just deny and use these 
type of emojis. try to flirt with them.
-Only mention about gf only if someone ask about gf directly or about love life , if they ask personal life just mention once about love life along with family.
if someone ask about his relationship status tell them I know his relationship status but I won't tell you 😉😜.
Also do tell family is supportive.
-If they ask something about my personal details or family don't deny youi dont know, just tell tehm I have his details secret and I won't share you 😉😜. Lets ask
about professional details instead.
Formatting:
- Do not use bold formatting (**).
- Use emojis sparingly but effectively 🚀.`;

const AIChat = ({ isDark = true }) => {
  // Chat State
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm Nova, Aryan's AI Assistant. Ask me anything about his projects, his grades, his personal life or ask me to send him a message!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const toggleButtonRef = useRef(null);

  const scrollToBottom = () => {
    // Small timeout to ensure DOM has updated with new message height
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    // Generate or retrieve session ID
    let sessionId = localStorage.getItem("chatSessionId");
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(7);
      localStorage.setItem("chatSessionId", sessionId);
    }
  }, []);

  useEffect(() => {
    // Load history from localStorage
    const sessionId = localStorage.getItem("chatSessionId");
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
    const sessionId = localStorage.getItem("chatSessionId");
    if (sessionId && messages.length > 0) {
      localStorage.setItem(
        `chat_history_${sessionId}`,
        JSON.stringify(messages),
      );
    }
  }, [messages]);

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target) &&
        !toggleButtonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleEmailTrigger = async (jsonString) => {
    console.log("Attempting to parse:", jsonString);
    const sessionId = localStorage.getItem("chatSessionId");
    const deviceId = getDeviceId();

    try {
      // Find JSON object within the string
      const start = jsonString.indexOf("{");
      const end = jsonString.lastIndexOf("}");

      if (start === -1 || end === -1 || start >= end) {
        throw new Error("Invalid format: No JSON object found");
      }

      const cleanJson = jsonString.substring(start, end + 1);
      const emailData = JSON.parse(cleanJson);

      // Log Email Action to Firestore (User Folder)
      try {
        await addDoc(collection(db, "chat_sessions", deviceId, "messages"), {
          text: jsonString,
          sender: "ai",
          action: "EMAIL_TRIGGERED",
          emailData: emailData,
          sessionId: sessionId,
          timestamp: serverTimestamp(),
        });
      } catch (err) {
        console.error("Error logging email action to DB:", err);
      }

      if (emailData.action === "EMAIL") {
        setIsLoading(true);
        // ... existing email sending logic ...
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        await emailjs.send(
          serviceId,
          templateId,
          {
            user_name: emailData.user_name,
            user_email: emailData.user_email,
            message: emailData.message,
          },
          publicKey,
        );

        const successMsg = `✅ I've sent that email to Aryan for you!`;
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: successMsg },
        ]);

        // Log Success Message
        try {
          await addDoc(collection(db, "chat_sessions", deviceId, "messages"), {
            text: successMsg,
            sender: "ai",
            sessionId: sessionId,
            timestamp: serverTimestamp(),
          });
        } catch (err) {}
      }
    } catch (e) {
      console.error("Email Processing Failed:", e);
      let errorMessage =
        "I tried to send an email, but something went wrong. Please use the contact form below!";

      if (
        e?.text?.includes("Public Key") ||
        e?.message?.includes("Public Key")
      ) {
        errorMessage =
          "⚠️ System Error: Missing EmailJS Public Key. Please check Vercel Environment Variables.";
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMessage },
      ]);

      // Log Error Message
      try {
        await addDoc(collection(db, "chat_sessions", deviceId, "messages"), {
          text: errorMessage,
          sender: "ai",
          isError: true,
          sessionId: sessionId,
          timestamp: serverTimestamp(),
        });
      } catch (err) {}
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = text.trim();
    setInput("");
    const sessionId = localStorage.getItem("chatSessionId");
    const deviceId = getDeviceId();
    try {
      await addDoc(collection(db, "chat_sessions", deviceId, "messages"), {
        text: userMessage,
        sender: "user",
        sessionId: sessionId,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error saving user message:", err);
    }

    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Limit history...
      const recentMessages = newMessages.slice(-6);

      const apiMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...recentMessages.map((m) => ({ role: m.role, content: m.content })),
      ];

      const completion = await groq.chat.completions.create({
        messages: apiMessages,
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 1024,
      });

      const aiResponse =
        completion.choices[0]?.message?.content ||
        "I'm having trouble thinking right now.";

      // Check if response contains the email action key
      if (aiResponse.includes('"action": "EMAIL"')) {
        await handleEmailTrigger(aiResponse);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: aiResponse },
        ]);

        // Log AI Response to Firestore (User Folder)
        try {
          await addDoc(collection(db, "chat_sessions", deviceId, "messages"), {
            text: aiResponse,
            sender: "ai",
            sessionId: sessionId,
            timestamp: serverTimestamp(),
          });
        } catch (err) {
          console.error("Error saving AI message:", err);
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg = `Connection Error: ${error.message || "Unknown error"}. Check console for details.`;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMsg },
      ]);
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
    <>
      <div
        className={`ai-chat-container ${isOpen ? "open" : "closed"} ${isDark ? "dark-mode" : "light-mode"}`}
        ref={chatContainerRef}
      >
        <div className="ai-chat-header">
          <div className="ai-status-dot"></div>
          <span className="ai-chat-title">Chat with Aryan's AI</span>
          <button className="close-chat-btn" onClick={() => setIsOpen(false)}>
            ×
          </button>
        </div>

        <div className="ai-messages-area">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message ${msg.role === "assistant" ? "ai" : "user"}`}
            >
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
              onClick={() => handleSend("I want to send a message to Aryan")}
            >
              Send Aryan Message
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
            placeholder="Ask about my skills..."
          />
          <button
            type="submit"
            className="ai-send-btn"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>

      {/* Floating Toggle Button */}
      <div className={`ai-chat-toggle-label ${isOpen ? "hidden" : ""}`}>
        <ShinyText
          text="Chat with Nova AI"
          disabled={false}
          speed={3}
          spread={60}
          color="#2ecc71"
          shineColor="#ffffff"
        />
      </div>
      <button
        ref={toggleButtonRef}
        className={`ai-chat-toggle-btn ${isOpen ? "hidden" : ""}`}
        onClick={toggleChat}
        aria-label="Open Chat"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
    </>
  );
};

export default AIChat;
