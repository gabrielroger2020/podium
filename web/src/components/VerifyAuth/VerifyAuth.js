'use client'
import api from "@/services/api";
import { useEffect } from "react";

export default function VerifyAuth () {

    useEffect(()=>{
        api.get(`/users/login?user=${sessionStorage.getItem("id")}&token=${sessionStorage.getItem("token-login")}`).then((response)=>{
            
        }).catch((err)=>{
            window.location.replace("/");
        })
    },[]);

    return(<>
    </>)
} 