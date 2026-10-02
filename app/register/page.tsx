"use client"

import { useState } from "react"

import styles from "./register.module.css"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { API_URL } from "@/lib/api"

export default function RegisterPage(){
    
     const router = useRouter()
    const[name,setName]=useState("")
     const[email,setEmail]=useState("")
      const[password,setPassword]=useState("")
      
    const [role, setRole] = useState("user")
     async function handleSubmit(e:React.SyntheticEvent<HTMLFormElement>){
        e.preventDefault()

        const endpoint=role === "operater" 
        ?`${API_URL}/auth/register/operater` 
        : `${API_URL}/auth/register/user`

       const responce = await fetch(endpoint,{method:"POST",
        headers:{"Content-Type":"application/json",},
        body:JSON.stringify({name,email,password}),});
      
      const data=await responce.json();
     
       if (!responce.ok) {
          console.log("Registration failed:", data)
          return
        }

       localStorage.setItem("accessToken", data.Access_TOken)
        localStorage.setItem("role", role)
       if (role === "operater") {
           router.push("/operater-homepage")
         } else {
          router.push("/address")    
         }
      }
      
   return (
  <div className={styles.container}>
    <div className={styles.formBox}>

      <h1 className={styles.title}>Register</h1>

      <form className={styles.form} onSubmit={handleSubmit}>

        <input
          className={styles.input}
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className={styles.input}
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className={styles.roleGroup}>
          <label>
          <input
          type="radio"
          placeholder="role"
          value="user"
          checked={role === "user"}
          onChange={(e) =>setRole(e.target.value)}
          />
          user
          </label>
          <label>
            <input
            type="radio"
            placeholder="role"
            value="operater"
            checked={role === "operater"}
            onChange={(e)=>setRole(e.target.value)}
            />
            operator
            </label>
        </div>
        <button className={styles.registerButton} type="submit">
          Register
        </button>

        <Link href={role === "operater" ? "/operaterlogin" : "/login"} className={styles.signInButton}>
  Have account? LogIn
</Link>

      </form>

    </div>
  </div>
);
}