// "use client"

// import { useState } from "react"




// export default function channelpage(){
//  const[name,setName]=useState("")
//  const[amount,setAmount]=useState("")
//  const[logo_path,setLogo_path]=useState("")
//  const[err,setError]=useState("")
//  async function handlesubmit(e:React.SubmitEvent){
//     e.preventDefault()
//     const responce=await fetch("http://localhost:3000/channel",{
//         method:"GET",
//     headers:{"Content-Type":"application/json",},
//        body:JSON.stringify({name,amount,logo_path})
//     })
//     const data=await responce.json()


//     if(!responce.ok){
//         console.log(data.message)
//         return
//     }

//     const token=localStorage.getItem("accessToken")
//     const role=localStorage.getItem("role")

//     if(!token || !role){
//       setError("you must login ")
//     }
    
//  }
// }










"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import styles from "./channel.module.css"

interface Channel {
  channel_id: string
  name: string
  amount: string
  logo_path?: string | null
}

const API_BASE = "http://localhost:3000"


function formatChannelName(name: string) {
  return name
    .split("_")
    .map((word) => (word === "HD" ? "HD" : word.charAt(0) + word.slice(1).toLowerCase()))
    .join(" ")
}

export default function ChannelPage() {
  const router = useRouter()
  const [channels, setChannels] = useState<Channel[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchChannels() {
      const token = localStorage.getItem("accessToken")
      const role = localStorage.getItem("role")

      if (!token || !role) {
        router.push("/login")
        return
      }

      try {
        const res = await fetch(`${API_BASE}/channel`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "role": role,
          },
        })
        const data = await res.json()

        if (!res.ok) {
          setError("Could not load channels. Please try again.")
          return
        }

        setChannels(data)
      } catch (err) {
        console.error(err)
        setError("Something went wrong")
      } finally {
        setLoading(false)
      }
    }
    fetchChannels()
  }, [router])

  function toggleChannel(channel_id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(channel_id)) {
        next.delete(channel_id)
      } else {
        next.add(channel_id)
      }
      return next
    })
  }

  function handleProceed() {
    const selectedChannels = channels.filter((c) => selected.has(c.channel_id))
    localStorage.setItem("selectedChannels", JSON.stringify(selectedChannels))
    router.push("/order")
  }

  const selectedChannels = channels.filter((c) => selected.has(c.channel_id))
  const total = selectedChannels.reduce((sum, c) => sum + Number(c.amount || 0), 0)

  if (loading) {
    return <div className={styles.centerMsg}>Loading channels…</div>
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
            <h1>Browse Channels</h1>
            <p>Select the channels you'd like to subscribe to</p>
          </div>
        </div>

        {channels.length === 0 ? (
          <p className={styles.emptyMsg}>No channels available right now.</p>
        ) : (
          <div className={styles.grid}>
            {channels.map((channel) => {
              const isSelected = selected.has(channel.channel_id)
              return (
                <button
                  key={channel.channel_id}
                  type="button"
                  className={`${styles.channelCard} ${isSelected ? styles.selected : ""}`}
                  onClick={() => toggleChannel(channel.channel_id)}
                >
                  <div className={styles.channelTop}>
                    <div className={styles.channelIcon}>
                      {channel.logo_path ? (
                        <img
                          src={`${API_BASE}${channel.logo_path}`}
                          alt={channel.name}
                          className={styles.channelIconImg}
                        />
                      ) : (
                        <span>📺</span>
                      )}
                    </div>
                    <span className={styles.checkbox}>{isSelected ? "✓" : ""}</span>
                  </div>
                  <div className={styles.channelNameRow}>
                    <span className={styles.channelName}>{formatChannelName(channel.name)}</span>
                  </div>
                  <span className={styles.channelPrice}>
                    <b>₹{channel.amount}</b> / month
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {channels.length > 0 && (
        <div className={styles.footer}>
          <span className={styles.footerSummary}>
            {selected.size === 0
              ? "No channels selected"
              : <>{selected.size} selected · <b>₹{total}</b>/month</>}
          </span>
          <button
            className={styles.proceedBtn}
            disabled={selected.size === 0}
            onClick={handleProceed}
          >
            Proceed to Order
          </button>
        </div>
      )}
    </div>
  )
}