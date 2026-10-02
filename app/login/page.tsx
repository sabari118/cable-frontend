"use client"

import { useState } from "react"

import style from "./login.module.css"
import { useRouter } from "next/navigation"
import { API_URL } from "@/lib/api"

export default function LoginUser(){
    const router = useRouter()
    const[email,setemail]=useState("")
    const[password,setpassword]=useState("")
    async function handleSubmit(e:React.SubmitEvent){
        e.preventDefault()
         
        const responce =await fetch(`${API_URL}/login`,{method:"POST",
            headers:{"Content-Type":"application/json",},
            body:JSON.stringify({email,password}),
        })
        const data=await responce.json()
        

        if(!responce.ok){
            console.log("Login failer:",data)
            return 
        }
        localStorage.setItem("accessToken", data.ACCESS_TOKEN)
        localStorage.setItem("REFRESH_TOKEN",data.REFRESH_TOKEN)
        localStorage.setItem("role",data.role)

        router.push("/home")  
    }
    return(
        <div className={style.container}>
            <div className={style.formBox}>
            <h1 className={style.title}>Sign In</h1>
            <form className={style.form}onSubmit={handleSubmit}>
              
                <input
                className={style.input}
                type="text"
                placeholder="email"
                value={email}
                onChange={(e)=>setemail(e.target.value)}
                />
                <input
                className={style.input}
                type="text"
                placeholder="password"
                value={password}
                onChange={(e)=>setpassword(e.target.value)}
                />

                <button className={style.button} type="submit">signIn</button>
            </form>
        </div>
        </div>
    )
}