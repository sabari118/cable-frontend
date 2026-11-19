"use client"

import { useRef, useState,useEffect } from "react"

import style from "./login.module.css"
import { useRouter } from "next/navigation"
import { API_URL } from "@/lib/api"

export default function LoginUser(){
    const router = useRouter()
    const[email,setemail]=useState("")
    const[password,setpassword]=useState("")
    const [error,setError]=useState("")
    const [loading,setLoading]=useState(false)
    const [notRegistered,setnotRegistered]=useState(false)
    const emailRef =useRef<HTMLInputElement>(null)
    const passwordRef=useRef<HTMLInputElement>(null)

    async function handleSubmit(e:React.SubmitEvent){
        e.preventDefault()

        if(email.trim().length === 0){
            setError("Email is required")
            emailRef.current?.focus()
            return
        }

        if(password.trim().length === 0){
            setError("Password is required")
            passwordRef.current?.focus()
            return
        }

        if(password.length < 6){
            setError("Password must be at least 6 characters long")
            passwordRef.current?.focus()
            return
        }

        setLoading(true)
         try{
        const responce =await fetch(`${API_URL}/auth/user/login`,{method:"POST",
            headers:{"Content-Type":"application/json",},
            body:JSON.stringify({email,password}),
        })
        const data=await responce.json()
        

        if(!responce.ok){
            const message=(Array.isArray(data.message) ? data.message.join(",") : data.message) || `login failed (status ${responce.status})`
           setError(String(message))
           setnotRegistered(responce.status === 404)
            return 
        }
        localStorage.setItem("accessToken", data.ACCESS_TOKEN)
        localStorage.setItem("REFRESH_TOKEN",data.REFRESH_TOKEN)
        localStorage.setItem("role",data.role)

        router.push("/home")  
    }catch(error){
        setError("An error occurred during login. Please try again later.")
    }finally{
        setLoading(false)
    }
    }
    return(
        <div className={style.container}>
            <div className={style.formBox}>
            <h1 className={style.title}>Sign In</h1>
            <form className={style.form}onSubmit={handleSubmit}>
              
                <input
                ref={emailRef}
                className={style.input}
                type="email"
                placeholder="email"
                value={email}
                onChange={(e)=>setemail(e.target.value)}
                />
                <input
                ref={passwordRef}
                className={style.input}
                type="password"
                placeholder="password"
                value={password}
                onChange={(e)=>setpassword(e.target.value)}
                />

                {error && <div className={style.error} role="alert">
                    <span>⚠️</span>
                    <span className={style.errorText}>{error}</span>
                </div>}

                <button className={style.button} type="submit" disabled={loading}>{loading ? "Signing in...": "Signin"}</button>
            </form>
        </div>
        </div>
    )
}