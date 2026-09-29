"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import styles from "./homepage.module.css"
import Link from "next/link"
import ChatWidget from "../components/chatWidget"

interface UserData {
  user_id: string
  name: string
  email: string
  role?: { name: string }
  address?: {
    door_no?: string
    area?: string
    state?: string
    street?: string
  } | null
}

export default function Homepage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchUser() {
      const token = localStorage.getItem("accessToken")
      const role = localStorage.getItem("role")

      if (!token || !role) {
        router.push("/login")
        return
      }

      try {
        const res = await fetch("http://localhost:3000/auth/homepage", {
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

        setUser(data.user ?? data.findMe ?? data)
      } catch (err) {
        console.error(err)
        setError("Something went wrong")
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [router])

  function handleLogout() {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("role")
    router.push("/login")
  }

  if (loading) {
    return <div className={styles.centerMsg}>Loading your account…</div>
  }

  if (error) {
    return <div className={styles.centerMsg}>{error}</div>
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() || "?"
  const address = user?.address

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>

        <div className={styles.header}>
          <div className={styles.avatar}>{initial}</div>
          <div className={styles.headerText}>
            <h1>{user?.name}</h1>
            <p>{user?.email}</p>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Log out
          </button>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Account</p>
            <div className={styles.cardRow}>
              <span>Name</span>
              <span>{user?.name}</span>
            </div>
            <div className={styles.cardRow}>
              <span>Email</span>
              <span>{user?.email}</span>
            </div>
            <div className={styles.cardRow}>
              <span>Role</span>
              <span>{user?.role?.name || "User"}</span>
            </div>
          </div>

          <div className={styles.card}>
            <p className={styles.cardLabel}>Address on file</p>
            {address ? (
              <>
                <div className={styles.cardRow}>
                  <span>Door No</span>
                  <span>{address.door_no}</span>
                </div>
                <div className={styles.cardRow}>
                  <span>Street</span>
                  <span>{address.street}</span>
                </div>
                <div className={styles.cardRow}>
                  <span>Area</span>
                  <span>{address.area}</span>
                </div>
                <div className={styles.cardRow}>
                  <span>State</span>
                  <span>{address.state}</span>
                </div>
              </>
            ) : (
              <p className={styles.noAddress}>
                No address on file yet. <Link href="/address">Add one</Link> to start ordering channels.
              </p>
            )}
          </div>
        </div>

        <p className={styles.sectionLabel}>Quick actions</p>
        <div className={styles.actions}>
          <Link href="/channel" className={styles.actionTile}>
            <span className={styles.actionIcon}>▤</span>
            <span className={styles.actionTitle}>channels</span>
            <span className={styles.actionDesc}>See what's available in your area</span>
          </Link>
         
          <Link href="/view-orders" className={styles.actionTile}>
            <span className={styles.actionIcon}>≡</span>
            <span className={styles.actionTitle}>View orders</span>
            <span className={styles.actionDesc}>Track your current subscriptions</span>
          </Link>
        </div>

      </div>
        <ChatWidget />
    </div>
  )
}