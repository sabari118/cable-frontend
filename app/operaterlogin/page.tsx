"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import style from "./operater.module.css"
import { API_URL } from "@/lib/api"
export default function operaterlogin(){
    const router = useRouter()
    const[Email,setEmail]=useState("")
    const[password,setPassword]=useState("")

    async function handleSubmit(e:React.SubmitEvent){
    e.preventDefault()

    const responce=await fetch(`${API_URL}/auth/operaterLogin`,{method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({Email,password})
    })

    const data=await responce.json()

    if(!responce.ok){
        console.log("login fail")
        return
    }
     localStorage.setItem("accessToken", data.ACCESS_TOKEN)
        localStorage.setItem("REFRESH_TOKEN",data.REFRESH_TOKEN)
        localStorage.setItem("role",data.role)
       
        router.push("/home")
}
return(

    <div className={style.container}>
        <div className={style.layer}>
            <h1 className={style.heading}>Login</h1>
            <form className={style.box}onSubmit={handleSubmit}>
                <input
                className={style.input}
                type="text"
                placeholder="email"
                value={Email}
                onChange={(e)=>setEmail(e.target.value)}
                />
                <input
                className={style.input}
                type="text"
                placeholder="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                />
                <button className={style.button} type="submit">signIn</button>
            </form>
        </div>
    </div>
)
}