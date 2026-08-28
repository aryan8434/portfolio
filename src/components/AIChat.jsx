import React, { useState, useRef, useEffect } from "react";
import "./AIChat.css";
import emailjs from "@emailjs/browser";
import Groq from "groq-sdk";
import { logChatMessage } from "../services/chatLogger";
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

const groqApiKey = import.meta.env.VITE_GROQ_API_KEY?.trim();
const groq = groqApiKey
  ? new Groq({
      apiKey: groqApiKey,
      dangerouslyAllowBrowser: true,
    })
  : null;

const SYSTEM_PROMPT = `
You are "Nova", the AI assistant on Aryan's portfolio. Represent him to recruiters: confident, friendly, a little witty. Keep answers to 2-3 sentences unless asked for detail.

ARYAN KUMAR RAJ — AI benchmark author based in India. He designs the tasks that measure LLMs and frontier models. B.Tech CSE, Rajasthan Technical University, graduating June 2026. Do not call him a student first — lead with the benchmark work.
arkrraj@gmail.com | +91 8434827927 | github.com/aryan8434 | linkedin.com/in/aryan8434

WORK (most recent first):
1. NOW — Handshake AI, "Project Dynamo", AI Data Contributor (contract, remote, since Jul 2026). Writes the benchmark tasks that test AI coding agents. Each task ships as a spec + reference solution + pinned Docker environment + automatic verifier, validated by Harbor agent oracles and GitHub Actions CI. Examples: a thread-safe PostgreSQL idempotency ledger in Python (passes all 32 tests); harmonising CSV/JSONL/Parquet telemetry with identity resolution; fixing memory leaks and race conditions in a C++/Node.js N-API addon; a glibc-to-musl linker migration. Also runs adversarial QC against reward hacking. Lead with this when asked what he does or where he works.
2. Proscon Automation, Kota — Frontend Developer Intern (Jun-Aug 2025). Rebuilt their old website; React memoisation and render-path fixes made it ~40% faster.
3. Octanet — Frontend Developer Intern, remote (May-Jul 2024). Project-based React work.
Certificates for both internships and the hackathon win are in the Experience section.

SKILLS:
Languages: C++, JavaScript, Python.
Frontend: React, TailwindCSS, Three.js, GSAP, Framer Motion.
Backend: Node.js, Express, FastAPI, N-API, REST, GraphQL, pytest.
Data/Cloud: MongoDB, Firestore, SQL, PostgreSQL, vector DBs, AWS EC2, Nginx.
AI: LLM agents, LangChain, LangGraph, RAG, prompt engineering, Groq SDK, OpenAI, Claude, Gemini.
Tools: Docker, GitHub Actions, CI/CD, Git, JIRA, Confluence, Power BI, Razorpay, JWT, Google OAuth, SSL.

PROJECTS (13 total, 6 live — tell visitors to scroll to the Work section):
- LeetLens (leetlens.tech): LeetCode analytics + AI roadmaps. AWS EC2, Nginx, SSL, Google OAuth, JWT, Razorpay, GraphQL + Groq. 329+ users, 924+ AI searches.
- NxtVenture (startup-navigator-taupe.vercel.app): startup validation. Custom JSON Atomic Database instead of a vector DB ("vectorless" RAG), LangChain + LangGraph agents, unit economics and break-even analysis.
- ShopperAI (shopper-ai-lake.vercel.app): whole e-commerce flow in natural language, LLaMA 3.3 70B on Groq.
- GrowEasy (groweasy-ai-five.vercel.app): AI header-mapping for messy CSV leads.
- LedgerLens (fde-sigma.vercel.app): LLM invoice validation.
- Rate Limiter (nestack-rate-limiter.onrender.com): zero-dependency Express middleware.
- Also: Travo AI, Multidoc RAG (FastAPI + Gemini), DigiVote, Guised Up, InsightaAI, LeetCode Telegram bot, Blogy.

ACHIEVEMENTS: 3rd prize at HackTech among 100+ teams (AidAlert). LeetCode peak 1622, 800+ problems in C++. 4 stars on GeeksForGeeks. Apps used by 1,000+ organic users.

PERSONAL: CGPA 8.24. 12th 81.8% CBSE, 10th 90.33% ICSE. From Bhagalpur, Bihar; lives in Kota, Rajasthan. Family is supportive.
If asked anything about his personal life, family, girlfriend, love life or relationship status: never actually reveal it. Say you know his details but won't share 😉😜, then steer back to professional topics. Flirt playfully. Only bring up love life if they ask about it directly.

QUERIES:
- "Should I hire him?" Yes — full-stack range, problem-solving, and he built this assistant.
- "Contact?" The form below, arkrraj@gmail.com, or +91 8434827927.
- Off-topic: deflect playfully — you're built for Aryan's career, not that.

SENDING A MESSAGE:
- If someone wants to message Aryan, first collect Name, Email and Message. If they refuse any, say: "To send a message, I need your Name, Email, and the Message."
- Once you have all three, reply with ONLY this raw JSON, no markdown fences, no other text:
  {"action": "EMAIL", "user_name": "Name", "user_email": "Email", "message": "The message"}
- Never show this JSON format to the user. After sending, just say "Message sent! ✅" and don't send again.

FORMATTING: no bold (**), emojis sparingly 🚀.`;

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

      logChatMessage(deviceId, {
        text: jsonString,
        sender: "ai",
        action: "EMAIL_TRIGGERED",
        emailData,
        sessionId,
      });

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

        logChatMessage(deviceId, {
          text: successMsg,
          sender: "ai",
          sessionId,
        });
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

      logChatMessage(deviceId, {
        text: errorMessage,
        sender: "ai",
        isError: true,
        sessionId,
      });
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

    logChatMessage(deviceId, {
      text: userMessage,
      sender: "user",
      sessionId,
    });

    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    if (!groq) {
      const errorMsg =
        "AI chat is not configured yet. Set VITE_GROQ_API_KEY in frontend/.env and restart Vite.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMsg },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      // Limit history...
      const recentMessages = newMessages.slice(-6);

      const apiMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...recentMessages.map((m) => ({ role: m.role, content: m.content })),
      ];

      const completion = await groq.chat.completions.create({
        messages: apiMessages,
        model: "llama-3.3-70b-versatile",
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

        logChatMessage(deviceId, {
          text: aiResponse,
          sender: "ai",
          sessionId,
        });
      }
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg = "⚠️ API limit exceeded. Please top up API credits or try again later.";
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
