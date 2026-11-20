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
    const[addressId,setAddressId]=useState<string | null>(null)
    const[loading,setLoading]=useState(false)
    const[err,setError]=useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (loading) return
    setError("")

    if (!aadhaarFile) {
      setError("Please select your aadhar card file")
      return
    }

    const token = localStorage.getItem("accessToken")
    const role = localStorage.getItem("role")

    if (!token || !role) {
      setError("you must be logged in")
      return
    }

    setLoading(true)

    try {
      let address_id = addressId

      // step 1: create the address only if it was not created already
      if (!address_id) {
        const addressRes = await fetch(`${API_URL}/address`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "role": role,
          },
          body: JSON.stringify({
            door_no: doorNo,
            area,
            state,
            street,
          }),
        })

        const addressData = await addressRes.json()

        if (!addressRes.ok) {
          const message = Array.isArray(addressData.message)
            ? addressData.message.join(", ")
            : addressData.message
          setError(String(message || "Failed to create address"))
          return
        }

        address_id = addressData.address_id
        setAddressId(address_id)
      }

      // step 2: upload the aadhaar file
      const formData = new FormData()
      formData.append("file", aadhaarFile)

      const fileRes = await fetch(`${API_URL}/attachement/${address_id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "role": role,
        },
        body: formData,
      })

      const fileData = await fileRes.json()

      if (!fileRes.ok) {
        const message = Array.isArray(fileData.message)
          ? fileData.message.join(", ")
          : fileData.message
        setError(
          `Address saved, but the Aadhaar upload failed: ${message || "unknown error"}. Click save to retry the upload.`
        )
        return
      }

      router.push("/home")
    } catch (error) {
      console.error(error)
      setError("Something went wrong. Please try again.")
    } finally {
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