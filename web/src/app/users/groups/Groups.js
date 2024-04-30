'use client'
import api from "@/services/api"
import {useEffect, useState} from "react"
import { MultiSelect, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconEdit } from "@tabler/icons-react";

export default function Groups(props){

    const [groups, setGroups] = useState([{value: "", label: "Carregando..."}]);

    const form = useForm({
        initialValues:{
            user: props.user,
            groups: [],
            user_creator: sessionStorage.getItem("id")
        }, validate: {
            groups: (value)=>(value.length == 0 ? 'Você deve selecionar no mínimo 1 grupo.' : null)
        }
    }
    );

    useEffect(()=>{
        api.get("/access-group/all").then((response)=>{
            let aux = [];
            response.data.forEach((element)=>{
                aux.push({value: `${element.id}`, label: element.name});
            })
           setGroups(aux);
        }).catch((error)=>{
            console.log()
            notifications.show({
                    title: "Erro!",
                    message: error.response.data.message,
                    color: "red"
                }
            )
        });

        api.get(`/users/access-group/${props.user}`).then((response)=>{
            let aux = [];
            response.data.access_groups.forEach((group)=>{
                aux.push(`${group}`);
            })
            form.setValues({groups: aux});
        }).catch((error)=>{
            notifications.show(
                {
                    title: "Erro!",
                    message: error.response.data.message,
                    color: "red"
                }
            )
        })
    },[])

    const sendData = (values)=>{
        api.post("/access-group/user",values).then((response)=>{
            notifications.show(
                {
                    title: "Sucesso!",
                    message: response.data.message,
                    color: "green"
                }
            )
        }).catch((error)=>{
            notifications.show(
                {
                    title: "Erro!",
                    message: error.response.data.message,
                    color: "red"
                }
            )
        })
    }


    return(<form onSubmit={form.onSubmit((values)=>{sendData(values)})}>
        <MultiSelect data={groups} {...form.getInputProps("groups")}></MultiSelect>
        <Button type="submit" color="yellow" leftSection={<IconEdit></IconEdit>}>Editar</Button>
    </form>)
}