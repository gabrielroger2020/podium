'use client'
import { MultiSelect, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import api from "@/services/api";
import { useEffect, useState } from "react";
import { IconEdit } from "@tabler/icons-react";
import { useForm } from "@mantine/form";

export default function Managers(props){

    const [users, setUsers] = useState([]);
    
    const form = useForm({
        initialValues: {
            user: sessionStorage.getItem("id"),
            team: props.id,
            managers: []
        }
    })

    const getAllUsers = ()=>{
        api.get("/users/users/all").then((response)=>{
            let aux = [];
            if(response.data.length > 0){
                response.data.forEach((user)=>{
                    aux.push({value: `${user.id}`, label: user.name});
                })
                setUsers(aux);
            }
        }).catch((error)=>{
            setUsers([]);
            notifications.show({
                title: "Erro!",
                message: "Não foi possível selecionar usuários.",
                color: "red"
            })
        })
    }

    const getManagers = ()=>{

        api.get(`/teams/managers/${props.id}`).then((response)=>{
            let aux = [];
            if(response.data.length > 0){
                aux = response.data.map((element)=> {return `${element.id}`});
            }

            form.setValues({managers: aux});
        }).catch((error)=>{
            notifications.show({
                title: "Erro!",
                message: "Não foi possível selecionar os gerentes dessa entidade.",
                color: "red"
            })
        })
    }

    const sendData = (values)=>{
        api.put(`/teams/managers`, values).then((response)=>{
            notifications.show({
                title: "Sucesso!",
                message: response.data.message,
                color: "green"
            });
        }).catch((error)=>{
            notifications.show({
                title: "Erro!",
                message: error.response.data.message,
                color: "red"
            });
        })
    }

    useEffect(()=>{
        getManagers();
        getAllUsers();
    }, [])

    return(<>
    <form onSubmit={form.onSubmit((e)=>{sendData(e)})}>
        <MultiSelect data={users} placeholder="Usuários" {...form.getInputProps("managers")}></MultiSelect>
        <Button type={"submit"} color="yellow" leftSection={<IconEdit></IconEdit>}>Editar</Button>
    </form>
    </>)
}