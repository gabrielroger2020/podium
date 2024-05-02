'use client'

import {useEffect, useState} from "react";
import { useForm } from "@mantine/form";
import { TextInput, Select, Button } from "@mantine/core";
import { IconSignature, IconPlayFootball, IconMedal, IconEdit } from "@tabler/icons-react";
import api from "@/services/api"
import { notifications } from "@mantine/notifications";

export default function Edit(props){

    const form = useForm({
        initialValues: {
            user_creator: sessionStorage.getItem("id"),
            id: props.id,
            name: "",
            entity: "",
            modality: ""
        }, validate: {
            name: (value)=>(value.length > 0 ? null : "Preencha esse campo."),
            modality: (value)=>(value != null && value != "" ? null : "Preencha esse campo."),
            entity: (value)=>(value != null && value != "" ? null : "Preencha esse campo.")
        }
    })

    const [modalities, setModalities] = useState([]);
    const [entities, setEntities] = useState([]);

    const sendData = (values)=>{
        api.put("/teams/update", values).then((response)=>{
            notifications.show({
                title: "Sucesso!",
                message: response.data.message,
                color: "green"
            })
            props.close();
            props.getTeams();
        }).catch((error)=>{
            notifications.show({
                title: "Erro!",
                message: error.response.data.message,
                collor: "red"
            })
        })
    }

    const getInfos = ()=>{
        api.get(`/teams/select?id=${props.id}`).then((response)=>{
            if(response.data.length > 0){
                
                let aux = response.data[0];
                aux.entity = `${aux.entity_id}`;
                aux.modality = `${aux.modality}`;
                form.setValues(aux);
                console.log(aux);
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

    //Consultando todas as modalidas para alimentar select.
    const getModalities = ()=>{
        api.get("/modalities/select").then((response)=>{

            let aux = []
            response.data.forEach((modality)=>{
                aux.push({value: `${modality.id}`, label: modality.name});
            })
            console.log(aux);
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
        getEntities();
        getModalities();
        getInfos();
    },[])

    return(<>
        <form onSubmit={form.onSubmit((e)=>{sendData(e)})}>
        <TextInput radius="xl" placeholder="Nome" leftSection={<IconSignature></IconSignature>} {...form.getInputProps("name")}></TextInput>
            <Select radius="xl" data={modalities} placeholder="Modalidade" leftSection={<IconPlayFootball></IconPlayFootball>} {...form.getInputProps("modality")}></Select>
            <Select radius="xl" data={entities} placeholder="Entidade" leftSection={<IconMedal></IconMedal>} {...form.getInputProps("entity")}></Select>
            <Button type="submit" color="yellow" leftSection={<IconEdit></IconEdit>}>Editar</Button>
        </form>
    </>)
}