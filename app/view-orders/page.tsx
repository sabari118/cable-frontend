"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import styles from "./view-orders.module.css"
import { API_URL } from "@/lib/api"

interface OrderChannel {
  channel_id: string
  name: string
  amount: string
}

interface Order {
  order_id: string
  payed_amounts: string | null
  status: "PENDING" | "SUCCESS" | "FAILED"
  createAt: string
  channel: OrderChannel[]
}

export default function ViewOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchOrders() {
      const token = localStorage.getItem("accessToken")
      const role = localStorage.getItem("role")

      if (!token || !role) {
        router.push("/login")
        return
      }

      try {
        const res = await fetch(`${API_URL}/order/AllOders`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "role": role,
          },
        })

        const data = await res.json()

        if (!res.ok) {
          setError("Session expired, please login again")
          router.push("/login")
          return
        }

        setOrders(data)
      } catch (err) {
        console.error(err)
        setError("Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [router])

  if (loading) {
    return <div className={styles.centerMsg}>Loading your orders…</div>
  }

  if (error) {
    return <div className={styles.centerMsg}>{error}</div>
  }

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>

        <div className={styles.header}>
          <Link href="/home" className={styles.backBtn}>← Back</Link>
          <div className={styles.headerText}>
            <h1>Your Orders</h1>
            <p>Everything you've subscribed to so far</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className={styles.centerMsg} style={{ minHeight: "auto", padding: "60px 0" }}>
            <p>No orders yet.</p>
            <Link href="/channel">Browse channels →</Link>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.order_id} className={styles.orderCard}>
              <div className={styles.orderTop}>
                <span className={styles.orderId}>#{order.order_id.slice(-8)}</span>
                <span className={`${styles.statusBadge} ${styles["status" + order.status]}`}>
                  {order.status}
                </span>
              </div>

              <div className={styles.channelList}>
                {order.channel.map((ch) => (
                  <span key={ch.channel_id} className={styles.channelPill}>
                    {ch.name}
                  </span>
                ))}
              </div>

              <div className={styles.orderBottom}>
                <span className={styles.orderDate}>
                  {new Date(order.createAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className={styles.orderAmount}>₹{order.payed_amounts}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}