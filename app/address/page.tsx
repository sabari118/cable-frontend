"use client"

import { useRouter } from "next/navigation";
import { useState } from "react";
import style from "./address.module.css"
import { API_URL } from "@/lib/api";
export default function AddressPage(){
    const router=useRouter()
    const[doorNo,setdoorNo]=useState("")
    const[area,setArea]=useState("")
    const[state,setState]=useState("")
    const[street,setStreet]=useState("")
    const[aadhaarFile,setAadhaarFile]=useState<File | null>(null)

    const[loading,setLoading]=useState(false)
    const[err,setError]=useState("")

    async function handleSubmit(e:React.SyntheticEvent<HTMLFormElement>){
    e.preventDefault()
    setError("")

    if(!aadhaarFile){
        setError("Please select your aadhar card file")
        return 
    }
    const token=localStorage.getItem("accessToken")
    const role=localStorage.getItem("role")

    if(!token || !role){
        setError("you must be logged in")
        return
    }
    setLoading(true)

    try{
        const addressRes=await fetch(`${API_URL}/address`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Authorization":`Bearer ${token}`,
                "role":role || "",
            },
            body:JSON.stringify({
                door_no:doorNo,
                area,
                state,
                street,

            }),
        })

        const addressData= await addressRes.json()

        if(!addressRes.ok){
            setError(addressData.message || "Failer to create address")
            setLoading(false)
            return 
        }

        const address_id=addressData.address_id

        const formData=new FormData()
        formData.append("file", aadhaarFile)

        const fileRes=await fetch(`${API_URL}/attachement/${address_id}`,{
            method:"POST",
            headers:{
                "Authorization":`Bearer ${token}`,
                "role":role,
            },
            body:formData
        })
        const fileData=await fileRes.json()

        if (!fileRes.ok) {
        setError(fileData.message || "Failed to upload Aadhaar card")
        setLoading(false)
        return
      }
       console.log("Success:", fileData)
      router.push("/home")

    }catch(err){
        console.error(err)
      setError("Something went wrong. Please try again.")
    }finally{
        setLoading(false)
    }
    }

    return(
        <div className={style.container}>
            <div className={style.formBox}>
                <h1 className={style.title}>Address Details</h1>
                <form className={style.form} onSubmit={handleSubmit}>
                    <input
                    className={style.input}
                    type="text"
                    placeholder="Door No"
                    value={doorNo}
                    onChange={(e)=>setdoorNo(e.target.value)}/>
                    <input
                    className={style.input}
                    type="text"
                    placeholder="area"
                    value={area}
                    onChange={(e)=>setArea(e.target.value)}/>
                    <input
                    className={style.input}
                    type="text"
                    placeholder="state"
                    value={state}
                    onChange={(e)=>setState(e.target.value)}/>
                    <input
                    className={style.input}
                    type="text"
                    placeholder="street"
                    value={street}
                    onChange={(e)=>setStreet(e.target.value)}/>
                    <input
                    className={style.input}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e)=>setAadhaarFile(e.target.files?.[0]||null)}
                    />

                    {err && <p className={style.error}>{err}</p>}
                    <button className={style.button } type="submit" disabled={loading}>
                        {loading ? "Submitting...":"save address"}
                        </button>
                </form>
            </div>

        </div>
    )
} 