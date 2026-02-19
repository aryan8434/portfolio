import React, { useRef, useState } from "react";
import "./Contact.css";
import emailjs from "@emailjs/browser";

const Contact = () => {
  const form = useRef();
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [error, setError] = useState("");

  const sendEmail = (e) => {
    e.preventDefault();
    setError("");

    // --- Validation Start ---
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

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!message || message.trim() === "") {
      setError("Please enter a message.");
      return;
    }

    // Count words (splitting by whitespace)
    const wordCount = message.trim().split(/\s+/).length;
    if (wordCount < 10) {
      setError("Message must be at least 10 words long.");
      return;
    }
    // --- Validation End ---

    setStatus("sending");

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    // Check if configuration is missing
    if (!serviceId || !templateId || !publicKey) {
      const missing = [];
      if (!serviceId || serviceId === "your-service-id-here") missing.push("Service ID");
      if (!templateId || templateId === "your-template-id-here") missing.push("Template ID");
      if (!publicKey || publicKey === "your-public-key-here") missing.push("Public Key");
      
      setStatus("error");
      setError(`EmailJS configuration missing: ${missing.join(", ")}. Please update your .env file.`);
      return;
    }

    console.log("Sending email with:", {
      serviceId,
      templateId: templateId.substring(0, 10) + "...",
      publicKey: publicKey.substring(0, 10) + "...",
    });

    emailjs
      .sendForm(serviceId, templateId, form.current, {
        publicKey: publicKey,
      })
      .then(
        () => {
          console.log("SUCCESS! Email sent successfully.");
          setStatus("success");
          form.current.reset(); // Reset the form
        },
        (error) => {
          console.error("EmailJS Error:", error);
          setStatus("error");
          
          // Show more specific error messages
          let errorMessage = "Failed to send message. ";
          
          if (error.text) {
            if (error.text.includes("Invalid") || error.text.includes("401") || error.text.includes("403")) {
              errorMessage += "Invalid EmailJS credentials. Please check your Service ID, Template ID, and Public Key.";
            } else if (error.text.includes("Template") || error.text.includes("template")) {
              errorMessage += "Template ID is invalid. Please check your EmailJS template configuration.";
            } else if (error.text.includes("Service") || error.text.includes("service")) {
              errorMessage += "Service ID is invalid. Please check your EmailJS service configuration.";
            } else {
              errorMessage += error.text;
            }
          } else {
            errorMessage += "Please check your browser console for details.";
          }
          
          setError(errorMessage);
        }
      );
  };

  return (
    <form ref={form} className="contact-form" onSubmit={sendEmail} noValidate>
      <h2>Contact Me</h2>

      <label className="field">
        <span className="label">Name</span>
        <input
          type="text"
          name="user_name"
          placeholder="Your full name"
          required
        />
      </label>

      <label className="field">
        <span className="label">Email</span>
        <input
          type="email"
          name="user_email"
          placeholder="you@example.com"
          required
        />
      </label>

      <label className="field">
        <span className="label">Message</span>
        <textarea
          name="message"
          placeholder="Write your messege here..."
          rows={6}
          required
        />
      </label>

      {error && <div className="form-error">{error}</div>}

      <div className="form-actions">
        <button
          type="submit"
          className="send-button"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Sending..." : "Send Message"}
        </button>
        {status === "success" && (
          <div className="form-success">Thanks — your message was sent.</div>
        )}
      </div>
    </form>
  );
};

export default Contact;
