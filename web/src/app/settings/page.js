'use client'
import { useEffect } from "react";
import Base from "../../components/Base/Base.js";
import { Tabs } from "@mantine/core";
import { IconUser, IconDeviceDesktop, IconFiles } from "@tabler/icons-react";
import UserSettings from "../user/UserSettings.js";
import UserDocs from "../user/UserDocs.js";
import "./settings.css";
import api from "@/services/api.js";

export default function Settings(){
    useEffect(()=>{
        api.get("/users/1").then((response)=>{
            console.log(response);
        }).catch((error)=>{
            console.log(error);
        })
    },[])
    return(
        <Base>
            <Tabs defaultValue="account">
                <Tabs.List>
                    <Tabs.Tab value="account" leftSection={<IconUser size="20"></IconUser>}>Conta</Tabs.Tab>
                    <Tabs.Tab value="docs" leftSection={<IconFiles size="20"></IconFiles>}>Meus documentos</Tabs.Tab>
                    <Tabs.Tab value="system" leftSection={<IconDeviceDesktop size="20"></IconDeviceDesktop>}>Sistema</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="account">
                    <UserSettings></UserSettings>
                </Tabs.Panel>
                <Tabs.Panel value="docs">
                    <UserDocs></UserDocs>
                </Tabs.Panel>
                <Tabs.Panel value="system">
                    Configurações do sistema.
                </Tabs.Panel>
            </Tabs>
        </Base>
    )
}