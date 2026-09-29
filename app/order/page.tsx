"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import Script from "next/script"
import styles from "./order.module.css"

interface Channel {
  channel_id: string
  name: string
  amount: string
}

// Razorpay injects this onto window once its script loads
declare global {
  interface Window {
    Razorpay: any
  }
}

export default function OrderPage() {
  const router = useRouter()
  const [channels, setChannels] = useState<Channel[]>([])
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState("")
  const [scriptReady, setScriptReady] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("selectedChannels")
    if (!stored) {
      router.push("/channel")
      return
    }
    try {
      setChannels(JSON.parse(stored))
    } catch {
      router.push("/channel")
    }
  }, [router])

  const total = channels.reduce((sum, c) => sum + Number(c.amount || 0), 0)

  async function handlePay() {
    setError("")
    const token = localStorage.getItem("accessToken")
    const role = localStorage.getItem("role")

    if (!token || !role) {
      router.push("/login")
      return
    }

    if (!scriptReady || !window.Razorpay) {
      setError("Payment is still loading, try again in a moment")
      return
    }

    setPaying(true)

    try {
      // Step 1: create the order on our backend (this also creates it on Razorpay)
      const res = await fetch("http://localhost:3000/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "role": role,
        },
        body: JSON.stringify({
          channelId: channels.map((c) => c.channel_id),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Could not create order")
        setPaying(false)
        return
      }

      // Step 2: open Razorpay's checkout popup with the order id we just got
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Number(data.amount) * 100,
        currency: "INR",
        name: "Cable Subscription",
        description: `${channels.length} channel(s)`,
        order_id: data.razorpayer_order_id,

        // Razorpay calls this with a `response` object once payment succeeds.
        // We verify it on the backend BEFORE trusting it — a browser-side
        // "success" alone can be faked, so nothing gets marked SUCCESS without
        // this round trip to /order/verify.
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("http://localhost:3000/order/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "role": role,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            if (!verifyRes.ok) {
              setError("Payment succeeded but verification failed. Please contact support.")
              setPaying(false)
              return
            }

            localStorage.removeItem("selectedChannels")
            router.push("/view-orders")
          } catch (err) {
            console.error(err)
            setError("Payment succeeded but verification failed. Please contact support.")
            setPaying(false)
          }
        },

        modal: {
          ondismiss: function () {
            setPaying(false)
          },
        },
        theme: {
          color: "#F2A93B",
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.on("payment.failed", function () {
        setError("Payment failed. Please try again.")
        setPaying(false)
      })
      razorpay.open()

    } catch (err) {
      console.error(err)
      setError("Something went wrong. Please try again.")
      setPaying(false)
    }
  }

  if (channels.length === 0) {
    return (
      <div className={styles.centerMsg}>
        <p>No channels selected yet.</p>
        <Link href="/channel">Go pick some channels →</Link>
      </div>
    )
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptReady(true)}
      />

      <div className={styles.page}>
        <div className={styles.wrap}>

          <div className={styles.header}>
            <Link href="/channel" className={styles.backBtn}>← Back</Link>
            <div className={styles.headerText}>
              <h1>Confirm your order</h1>
              <p>Review your selection before paying</p>
            </div>
          </div>

          <div className={styles.card}>
            <p className={styles.cardLabel}>Selected channels</p>
            {channels.map((channel) => (
              <div key={channel.channel_id} className={styles.lineItem}>
                <span className={styles.lineItemName}>{channel.name}</span>
                <span className={styles.lineItemPrice}>₹{channel.amount}</span>
              </div>
            ))}
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total / month</span>
              <span className={styles.totalAmount}>₹{total}</span>
            </div>
          </div>

          <button className={styles.payBtn} onClick={handlePay} disabled={paying}>
            {paying ? "Processing…" : `Pay ₹${total}`}
          </button>

          {error && <p className={styles.errorText}>{error}</p>}
        </div>
      </div>
    </>
  )
}