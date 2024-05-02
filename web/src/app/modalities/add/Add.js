'use client'

import {useEffect, useState} from "react";
import { useForm } from "@mantine/form";
import { TextInput, Select, Button } from "@mantine/core";
import { IconSignature, IconUsersGroup, IconMedal, IconPlus } from "@tabler/icons-react";
import api from "@/services/api"
import { notifications } from "@mantine/notifications";

export default function Add(props){

    const form = useForm({
        initialValues: {
            user_creator: sessionStorage.getItem("id"),
            name: "",
            type: "",
            type_marker: ""
        }, validate: {
            name: (value)=>(value.length > 0 ? null : "Preencha esse campo."),
            type: (value)=>(value != null && value != "" ? null : "Preencha esse campo."),
            type_marker: (value)=>(value != null && value != "" ? null : "Preencha esse campo.")
        }
    })

    const sendData = (values)=>{
        api.post("/modalities/register", values).then((response)=>{
            notifications.show({
                title: "Sucesso!",
                message: response.data.message,
                color: "green"
            })

            props.getModalities();
            props.close();
        }).catch((error)=>{
            notifications.show({
                title: "Erro!",
                message: error.response.data.message,
                collor: "red"
            })
        })
    }

    return(<>
        <form onSubmit={form.onSubmit((e)=>{sendData(e)})}>
            <TextInput radius="xl" placeholder="Nome" leftSection={<IconSignature></IconSignature>} {...form.getInputProps("name")}></TextInput>
            <Select radius="xl" data={[{value: "collective", label: "Coletivo"},{value: "individual", label: "Individual"}]} placeholder="Tipo" leftSection={<IconUsersGroup></IconUsersGroup>} {...form.getInputProps("type")}></Select>
            <Select radius="xl" data={[{value: "goals", label: "Gols"},{value: "points", label: "Pontos"}]} placeholder="Marcador" leftSection={<IconMedal></IconMedal>} {...form.getInputProps("type_marker")}></Select>
            <Button type="submit" color="green" leftSection={<IconPlus></IconPlus>}>Cadastrar</Button>
        </form>
    </>)
}