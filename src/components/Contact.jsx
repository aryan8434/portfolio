import React, { useRef, useState } from "react";
import "./Contact.css";
import emailjs from "@emailjs/browser";
import { useReveal } from "../hooks/useReveal";

const SOCIALS = [
  {
    label: "GitHub",
    handle: "@aryan8434",
    href: "https://github.com/aryan8434",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 015 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0012 2z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    handle: "Aryan Kumar Raj",
    href: "https://www.linkedin.com/in/aryan-kumar-raj-988587b3/",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.75V21h-4v-5.6c0-1.34-.03-3.06-1.9-3.06-1.9 0-2.2 1.45-2.2 2.96V21H9z" />
      </svg>
    ),
  },
  {
    label: "LeetCode",
    handle: "1500+ rating",
    href: "https://leetcode.com/u/aryan8434/",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 4l-6.5 6.5a3 3 0 000 4.2L11 18.2a3 3 0 004.2 0L17 16.4" />
        <path d="M10 12h9" />
      </svg>
    ),
  },
  {
    label: "GeeksForGeeks",
    handle: "4★ coder",
    href: "https://www.geeksforgeeks.org/profile/aryan8434",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12a4 4 0 108 0 4 4 0 00-8 0" />
      </svg>
    ),
  },
];

const Contact = () => {
  const form = useRef();
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [error, setError] = useState("");
  useReveal([]);

  const sendEmail = (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(form.current);
    const userName = formData.get("user_name");
    const userEmail = formData.get("user_email");
    const message = formData.get("message");

    if (!userName || userName.trim() === "") {
      setError("Please enter your name.");
      return;
    }
    if (!userEmail || userEmail.trim() === "") {
      setError("Please enter your email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!message || message.trim() === "") {
      setError("Please enter a message.");
      return;
    }
    if (message.trim().split(/\s+/).length < 10) {
      setError("Message must be at least 10 words long.");
      return;
    }

    setStatus("sending");

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      const missing = [];
      if (!serviceId || serviceId === "your-service-id-here")
        missing.push("Service ID");
      if (!templateId || templateId === "your-template-id-here")
        missing.push("Template ID");
      if (!publicKey || publicKey === "your-public-key-here")
        missing.push("Public Key");

      setStatus("error");
      setError(
        `EmailJS configuration missing: ${missing.join(", ")}. Please update your .env file.`,
      );
      return;
    }

    emailjs
      .sendForm(serviceId, templateId, form.current, { publicKey })
      .then(
        () => {
          setStatus("success");
          form.current.reset();
        },
        (err) => {
          console.error("EmailJS Error:", err);
          setStatus("error");

          let errorMessage = "Failed to send message. ";
          if (err.text) {
            if (
              err.text.includes("Invalid") ||
              err.text.includes("401") ||
              err.text.includes("403")
            ) {
              errorMessage +=
                "Invalid EmailJS credentials. Please check your Service ID, Template ID, and Public Key.";
            } else if (err.text.toLowerCase().includes("template")) {
              errorMessage +=
                "Template ID is invalid. Please check your EmailJS template configuration.";
            } else if (err.text.toLowerCase().includes("service")) {
              errorMessage +=
                "Service ID is invalid. Please check your EmailJS service configuration.";
            } else {
              errorMessage += err.text;
            }
          } else {
            errorMessage += "Please check your browser console for details.";
          }
          setError(errorMessage);
        },
      );
  };

  return (
    <div className="contact">
      <header className="section-head reveal">
        <span className="eyebrow">Get in touch</span>
        <h2 className="section-title">
          Let&apos;s build <span className="grad-text">something good</span>
        </h2>
        <p className="section-sub">
          I&apos;m open to full-time roles, internships and freelance work.
          Drop a message below — or reach me directly on any of these.
        </p>
      </header>

      <div className="contact__grid">
        <aside className="contact__side reveal">
          <a className="contact__mail" href="mailto:arkrraj@gmail.com">
            <span className="contact__mail-label">Email me at</span>
            <span className="contact__mail-value">arkrraj@gmail.com</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>

          <div className="contact__location">
            <span className="contact__ping" />
            Based in Kota, Rajasthan · open to relocate
          </div>

          <ul className="contact__socials">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  <span className="contact__social-icon">{s.icon}</span>
                  <span className="contact__social-text">
                    <strong>{s.label}</strong>
                    <em>{s.handle}</em>
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 17L17 7M17 7H9M17 7v8"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <form
          ref={form}
          className="contact__form reveal"
          onSubmit={sendEmail}
          noValidate
          style={{ "--reveal-delay": "90ms" }}
        >
          <div className="contact__row">
            <label className="field">
              <span className="field__label">Name</span>
              <input type="text" name="user_name" placeholder="Your full name" required />
            </label>

            <label className="field">
              <span className="field__label">Email</span>
              <input
                type="email"
                name="user_email"
                placeholder="you@example.com"
                required
              />
            </label>
          </div>

          <label className="field">
            <span className="field__label">Message</span>
            <textarea
              name="message"
              placeholder="Tell me about the role, the project, or just say hi — at least 10 words."
              rows={6}
              required
            />
          </label>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <div className="contact__submit">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={status === "sending"}
            >
              {status === "sending" ? "Sending…" : "Send message"}
              {status !== "sending" && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            {status === "success" && (
              <div className="form-success" role="status">
                Thanks — your message is on its way.
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Contact;
