"use client"

import { API_URL } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import style from "./createcomplain.module.css"
import Link from "next/link"


export default function CreateComplainPage(){
    const router=useRouter()
    const [complains,setComplains]=useState("")
    const [status,setStatus]=useState("")
    const[loading,setLoading]=useState(false)
    const[error,setError]=useState("")


    useEffect(()=>{
        const token=localStorage.getItem("accessToken")
        const role=localStorage.getItem("role")

        if(!token||!role){
            router.push("/login")
        }
    },[router])

    async function handleSubmit(e:React.SubmitEvent){
        e.preventDefault()
        setError("")

        if(complains.length>250){
            setError("complain should be less than 250 characters")
            return 
        }
        if(!status){
            setError("status is required")
            return 
        }

         const token=localStorage.getItem("accessToken")
        const role=localStorage.getItem("role")

        if(!token||!role){
            router.push("/login")
            return
        }
        setLoading(true)

        try{
            const responce=await fetch(`${API_URL}/complain/create/complaines`,{
                method:"POST",
                headers:{"Content-Type":"application/json",
                    "Authorization":`Bearer ${token}`,
                    "role":role
            },
                body:JSON.stringify({complains,status})
            })

            const data=await responce.json()

            if(!responce.ok){
                const message=(Array.isArray(data.message) ? data.message.join(",") : data.message) || `complain creation failed (status ${responce.status})`
                setError(String(message))
                return 
            }
                router.push("/view-complains")
        }catch(error){
            setError("complain creation failed")
        }finally{
            setLoading(false)
        }
    }


    return(
        <div className={style.container}>
            <div className={style.biggBox}>
                <div className={style.topRow}>
                    <Link href="/home" className={style.backButton}>← Back</Link>
                    <h1 className={style.heading}>Create Complain</h1>
                </div>

                <form onSubmit={handleSubmit} className={style.form}>
                    <label htmlFor="complain" className={style.lable}>Describe your complains</label>
                    <textarea
                    id="complain"
                    className={style.textarea}
                    rows={6}
                    maxLength={250}
                    value={complains}
                    onChange={(e)=>setComplains(e.target.value)}
                    disabled={loading}
                    />
                    <div className={style.counter}>{complains.length}/250</div>
                    <label htmlFor="status" className={style.lable}>status</label>
                    <select 
                    id="status"
                    className={style.select}
                    value={status}
                    onChange={(e)=>setStatus(e.target.value)}
                    disabled={loading}
                    >

                        <option value="">select status</option>
                        <option value="PENDING">PENDING</option>
                    </select>
                    {error && <p className={style.submitButton}>{error}</p>}

                    <button type="submit" className={style.submitButton} disabled={loading}>
                        {loading ? "submitting..":"submit complaint"}
                    </button>
                </form>
            </div>
        </div>
    )

}