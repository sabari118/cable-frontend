"use client"

import styles from "./complain.module.css"
import { API_URL } from "@/lib/api"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Complain {
  complain_id: string
  complains: string
  status: string
  feedback: string | null
  createAt: string
}

export default function ComplainPage() {
  const router = useRouter()
  const [complains, setComplains] = useState<Complain[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setError] = useState("")

  useEffect(() => {
    async function fetchComplains() {
      const token = localStorage.getItem("accessToken")
      const role = localStorage.getItem("role")

      if (!token || !role) {
        router.push("/login")
        return
      }

      try {
        const res = await fetch(`${API_URL}/complain/view/complains`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "role": role,
          },
        })
        const data = await res.json()

        console.log("complains data:", data)
        if (!res.ok) {
          setError("Could not load complaints. Please log in again.")
          return
        }
        setComplains(data)
      } catch (error) {
        setError("Failed to fetch complaints")
      } finally {
        setLoading(false)
      }
    }
    fetchComplains()
  }, [router])

  if (loading) {
    return <div className={styles.centerMsg}>Loading...</div>
  }
  if (err) {
    return <div className={styles.centerMsg}>{err}</div>
  }

  return (
    <div className={styles.container}>
       
      <div className={styles.biggBox}>
        <div className={styles.topRow}>
           <Link href="/home" className={styles.backButton}>← Back</Link>
          <h1 className={styles.heading}>View Complaints</h1>
          {/* status filter goes here later */}
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Complaint</th>
              <th>Status</th>
              <th>Feedback</th>
            </tr>
          </thead>
          <tbody>
            {complains.map((c) => (
              <tr key={c.complain_id}>
                <td>{c.complains}</td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      c.status === "PENDING" ? styles.badgePending : styles.badgeOther
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className={c.feedback ? "" : styles.muted}>
                  {c.feedback ?? "No feedback yet"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {complains.length === 0 && (
          <p className={styles.empty}>No complaints yet.</p>
        )}
      </div>
    </div>
  )
}