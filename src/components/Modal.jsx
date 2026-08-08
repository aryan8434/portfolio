import React, { useEffect, useState, useCallback } from "react";
import "./Modal.css";

/**
 * Document viewer with a symmetric open/close animation.
 *
 * The panel has to stay mounted while it animates away, so `closing` drives
 * the exit and unmount happens only after the animation finishes.
 */
const Modal = ({ open, onClose, title, subtitle, src, downloadName }) => {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  const beginClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setMounted(false);
      onClose?.();
    }, 320); // matches --modal-exit in Modal.css
  }, [onClose]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
    } else if (mounted && !closing) {
      beginClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e) => e.key === "Escape" && beginClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mounted, beginClose]);

  if (!mounted) return null;

  return (
    <div
      className={`modal ${closing ? "is-closing" : ""}`}
      onClick={beginClose}
      role="presentation"
    >
      <div
        className="modal__panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal__close"
          onClick={beginClose}
          aria-label="Close"
          title="Close (Esc)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <header className="modal__bar">
          <div className="modal__heading">
            <strong>{title}</strong>
            {subtitle && <span>{subtitle}</span>}
          </div>
          <a
            className="btn btn-ghost btn-sm modal__download"
            href={src}
            download={downloadName}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Download
          </a>
        </header>

        <div className="modal__viewport">
          <iframe src={src} title={title} className="modal__frame" />
        </div>
      </div>
    </div>
  );
};

export default Modal;
