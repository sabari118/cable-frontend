// "use client"

// import { useState } from "react"

// import styles from "./register.module.css"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { API_URL } from "@/lib/api"

// export default function RegisterPage(){
    
//      const router = useRouter()
//     const[name,setName]=useState("")
//      const[email,setEmail]=useState("")
//       const[password,setPassword]=useState("")
      
//     const [role, setRole] = useState("user")
//      async function handleSubmit(e:React.SyntheticEvent<HTMLFormElement>){
//         e.preventDefault()

//         const endpoint=role === "operater" 
//         ?`${API_URL}/auth/register/operater` 
//         : `${API_URL}/auth/register/user`

//        const responce = await fetch(endpoint,{method:"POST",
//         headers:{"Content-Type":"application/json",},
//         body:JSON.stringify({name,email,password}),});
      
//       const data=await responce.json();
     
//        if (!responce.ok) {
//           console.log("Registration failed:", data)
//           return
//         }

//        localStorage.setItem("accessToken", data.Access_TOken)
//         localStorage.setItem("role", role)
//        if (role === "operater") {
//            router.push("/operater-homepage")
//          } else {
//           router.push("/address")    
//          }
//       }
      
//    return (
//   <div className={styles.container}>
//     <div className={styles.formBox}>

//       <h1 className={styles.title}>Register</h1>

//       <form className={styles.form} onSubmit={handleSubmit}>

//         <input
//           className={styles.input}
//           type="text"
//           placeholder="Full Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />

//         <input
//           className={styles.input}
//           type="email"
//           placeholder="E-mail"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />

//         <input
//           className={styles.input}
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />

//         <div className={styles.roleGroup}>
//           <label>
//           <input
//           type="radio"
//           placeholder="role"
//           value="user"
//           checked={role === "user"}
//           onChange={(e) =>setRole(e.target.value)}
//           />
//           user
//           </label>
//           <label>
//             <input
//             type="radio"
//             placeholder="role"
//             value="operater"
//             checked={role === "operater"}
//             onChange={(e)=>setRole(e.target.value)}
//             />
//             operator
//             </label>
//         </div>
//         <button className={styles.registerButton} type="submit">
//           Register
//         </button>

//         <Link href={role === "operater" ? "/operaterlogin" : "/login"} className={styles.signInButton}>
//   Have account? LogIn
// </Link>

//       </form>

//     </div>
//   </div>
// );
// }

"use client"

import { API_URL } from "@/lib/api"
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react"
import AuthLayout from "../component/layout/AuthLayout"
import InputField from "../component/ui/InputField"
import styles from "./register.module.css"
import RoleOption from "../component/ui/RoleOption"
import Link from "next/link"


const roles =[{value:"user",label:"User"},{value:"operater",label:"Operater"}]

export default function RegisterPage(){
    
     const route = useRouter()
    const[name,setName]=useState("")
     const[email,setEmail]=useState("")
      const[password,setPassword]=useState("")
      const [error,setError]=useState("")
      const[loading,setLoading]=useState(false)
    const [role, setRole] = useState("")

    const nameRef= useRef<HTMLInputElement>(null)
    const emailRef=useRef<HTMLInputElement>(null)
    const passwordRef=useRef<HTMLInputElement>(null)
    const roleRef=useRef<HTMLInputElement>(null)


     useEffect(() => {
    nameRef.current?.focus()
  }, [])


     async function handleSubmit(e:React.SyntheticEvent<HTMLFormElement>){
        e.preventDefault()
        
        if(name.trim().length === 0 ){
          setError("name is required")
          nameRef.current?.focus()
          return
        }

        if(email.trim().length === 0){
          setError("Email is required")
          emailRef.current?.focus()
          return 
        }

        if(password.length === 0){
          setError("password is required")
          passwordRef.current?.focus()
          return 
        }

        if(password.length <6){
          setError("Password must be at least 6 characters long")
          passwordRef.current?.focus()
          return 
        }

        if(!role){
          setError("role is required")
          roleRef.current?.focus()
          return 
        }

        setLoading(true)

try{
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

        localStorage.setItem("AccessToken",data.Access_TOken)
        localStorage.setItem("role",role)
        if(role==="operater"){
            route.push("/operater-homepage")
        }else{
            route.push("/address")
        }
    }catch(error){
        console.log(error)
        setError("Cannot reach the server. Please try again later.")
    }finally{
        setLoading(false)
    }
 }
 return (
       <AuthLayout>

        <h1 className={styles.title}>Register</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
        <InputField
        type="text"
        placeholder="Full name"
        value={name}
        onChange={(e)=> setName(e.target.value)}
        />
        <InputField
        type="email"
        placeholder="email"
        value={email}
        onChange={(e)=> setEmail(e.target.value)}
        />

        <InputField
        type="password"
        placeholder="password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        />

        <p className={styles.roleText}>select the role</p>

        <div className={styles.roleGroup}>
           {roles.map((r) => (
            <RoleOption
              key={r.value}
              value={r.value}
              label={r.label}
              checked={role === r.value}
              onChange={(e) => setRole(e.target.value)}
            />
          ))}
        </div>
        {error && (<div className={styles.error} role="alert">
            <span>⚠️</span>
            <span className={styles.errorText}>{error}</span>
        </div>)}
        <button className={styles.registerButton} type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
        <Link 
        href={role === "operater" ? "operaterlogin" : "login"} className={styles.signInButton}>Have account? Log in</Link>
        </form>
       </AuthLayout>
        )
 
}
