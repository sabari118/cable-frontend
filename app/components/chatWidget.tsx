"use client"

import { useState, useRef, useEffect } from "react"
import styles from "./ChatWidget.module.css"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface ChatWidgetProps {
  // pass true on pages that already have a sticky bottom bar (Channel, Order)
  // so the chat button doesn't overlap it
  liftedUp?: boolean
}

export default function ChatWidget({ liftedUp = false }: ChatWidgetProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || sending) return

    const token = localStorage.getItem("accessToken")
    const role = localStorage.getItem("role")

    if (!token || !role) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Please log in to chat." }])
      return
    }

    setMessages((prev) => [...prev, { role: "user", content: text }])
    setInput("")
    setSending(true)

    try {
      const res = await fetch("http://localhost:3000/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "role": role,
        },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()

      const reply = data.reply ?? data.message ?? data.response ?? JSON.stringify(data)
      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
    } catch (err) {
      console.error(err)
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Try again." }])
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      <button
        className={`${styles.fab} ${liftedUp ? styles.fabLifted : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Open chat assistant"
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className={`${styles.panel} ${liftedUp ? styles.panelLifted : ""}`}>
          <div className={styles.panelHeader}>
            <span>Assistant</span>
          </div>

          <div className={styles.messages} ref={scrollRef}>
            {messages.length === 0 && (
              <p className={styles.emptyHint}>Ask about channels, orders, or anything else.</p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`${styles.bubble} ${m.role === "user" ? styles.bubbleUser : styles.bubbleBot}`}
              >
                {m.content}
              </div>
            ))}
            {sending && <div className={`${styles.bubble} ${styles.bubbleBot}`}>Typing…</div>}
          </div>

          <div className={styles.inputRow}>
            <input
              className={styles.input}
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className={styles.sendBtn} onClick={handleSend} disabled={sending}>
              →
            </button>
          </div>
        </div>
      )}
    </>
  )
}