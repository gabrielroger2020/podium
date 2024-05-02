'use client'

import {useEffect, useState} from "react";
import { useForm } from "@mantine/form";
import { TextInput, Select, Button } from "@mantine/core";
import { IconSignature, IconUsersGroup, IconMedal, IconPlus, IconPlayFootball } from "@tabler/icons-react";
import api from "@/services/api"
import { notifications } from "@mantine/notifications";

export default function Add(props){

    const [modalities, setModalities] = useState([]);
    const [entities, setEntities] = useState([]);

    const form = useForm({
        initialValues: {
            user_creator: sessionStorage.getItem("id"),
            name: "",
            modality: "",
            entity: ""
        }, validate: {
            name: (value)=>(value.length > 0 ? null : "Preencha esse campo."),
            modality: (value)=>(value != null && value != "" ? null : "Preencha esse campo."),
            entity: (value)=>(value != null && value != "" ? null : "Preencha esse campo.")
        }
    })

    const sendData = (values)=>{
        api.post("/teams/register", values).then((response)=>{
            notifications.show({
                title: "Sucesso!",
                message: response.data.message,
                color: "green"
            })

            props.getTeams();
            props.close();
        }).catch((error)=>{
            notifications.show({
                title: "Erro!",
                message: error.response.data.message,
                collor: "red"
            })
        })
    }

    //Consultando todas as modalidas para alimentar select.
    const getModalities = ()=>{
        api.get("/modalities/select").then((response)=>{

            let aux = []
            response.data.forEach((modality)=>{
                aux.push({value: `${modality.id}`, label: modality.name});
            })

            setModalities(aux);

        }).catch((error)=>{
            notifications.show({
                title: "Erro!",
                message: "Não foi possível selecionarmos as modalidades",
                color: "red"
            })
        })
    }

    //Consultando todas as entidades para alimentar select.
    const getEntities = ()=>{

        let path = "/entities/select?";

        if(window.location.pathname != "/teams"){
            path += `user_id${sessionStorage.getItem("id")}`;
        }

        api.get(path).then((response)=>{

            let aux = [];

            response.data.forEach((entity)=>{
                aux.push({value: `${entity.id}`, label: entity.name_official});
            });

            setEntities(aux);

        }).catch((error)=>{
            notifications.show({
                title: "Erro!",
                message: "Não foi possível selecionarmos as entidades",
                color: "red"
            })
        })
    }

    useEffect(()=>{
        getModalities();
        getEntities();
    }, [])

    return(<>
        <form onSubmit={form.onSubmit((e)=>{sendData(e)})}>
            <TextInput radius="xl" placeholder="Nome" leftSection={<IconSignature></IconSignature>} {...form.getInputProps("name")}></TextInput>
            <Select radius="xl" data={modalities} placeholder="Modalidade" leftSection={<IconPlayFootball></IconPlayFootball>} {...form.getInputProps("modality")}></Select>
            <Select radius="xl" data={entities} placeholder="Entidade" leftSection={<IconMedal></IconMedal>} {...form.getInputProps("entity")}></Select>
            <Button type="submit" color="green" leftSection={<IconPlus></IconPlus>}>Cadastrar</Button>
        </form>
    </>)
}