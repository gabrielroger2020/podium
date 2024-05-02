'use client'

import {useEffect, useState} from "react";
import { useForm } from "@mantine/form";
import { TextInput, Select, Button } from "@mantine/core";
import { IconSignature, IconUsersGroup, IconMedal, IconEdit } from "@tabler/icons-react";
import api from "@/services/api"
import { notifications } from "@mantine/notifications";

export default function Edit(props){

    const form = useForm({
        initialValues: {
            user_creator: sessionStorage.getItem("id"),
            id: props.id,
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
        api.put("/modalities/update", values).then((response)=>{
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

    const getInfos = ()=>{
        api.get(`/modalities/select?id=${props.id}`).then((response)=>{
            if(response.data.length > 0){
                form.setValues(response.data[0]);
            }else{
                notifications.show({
                    title: "Erro!",
                    message: "Não encontramos os dados dessa modalidade.",
                    color: "red"
                })
            }
            
        }).catch((error)=>{
            notifications.show({
                title: "Erro!",
                message: error.response.data.message,
                color: "red"
            })
        })
    }

    useEffect(()=>{
        getInfos();
    },[])

    return(<>
        <form onSubmit={form.onSubmit((e)=>{sendData(e)})}>
            <TextInput radius="xl" placeholder="Nome" leftSection={<IconSignature></IconSignature>} {...form.getInputProps("name")}></TextInput>
            <Select radius="xl" data={[{value: "collective", label: "Coletivo"},{value: "individual", label: "Individual"}]} placeholder="Tipo" leftSection={<IconUsersGroup></IconUsersGroup>} {...form.getInputProps("type")}></Select>
            <Select radius="xl" data={[{value: "goals", label: "Gols"},{value: "points", label: "Pontos"}]} placeholder="Marcador" leftSection={<IconMedal></IconMedal>} {...form.getInputProps("type_marker")}></Select>
            <Button type="submit" color="yellow" leftSection={<IconEdit></IconEdit>}>Editar</Button>
        </form>
    </>)
}