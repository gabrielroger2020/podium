'use client'
import api from "@/services/api";
import { TextInput, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconBuilding, IconEdit } from "@tabler/icons-react";
import { useEffect } from "react";

export default function Edit(props){

    const form = useForm({
        initialValues: {
            id: props.id,
            name: ""
        }, validate: {
            name: (value)=>(value.length > 0 ? null : 'Esse campo precisa ter no mínimo 1 catactere.')
        }
    })

    const getInfos = ()=>{
        api.get(`entities/category/select/${props.id}`).then((response)=>{
            form.setValues({name: response.data[0].name});
        }).catch((error)=>{
            notifications.show({
                title: "Erro!",
                message: error.response.data,
                color: "red"
            })
        })
    }

    useEffect(()=>{
        getInfos();
    },[])

    const sendData = (values)=>{
        api.put("/entities/category/update", values).then((response)=>{

            notifications.show({
                title: "Sucesso!",
                message: response.data.message,
                color: "green"
            })
            props.getAllCategoriesEntities();
            props.closeModal();
        }).catch((error)=>{
            console.log(error);
            notifications.show({
                title: "Erro!",
                message: error.response.data.message,
                color: "red"
            })
        })
    }

    return(
        <form onSubmit={form.onSubmit((e)=>{sendData(e)})}>
            <TextInput radius="xl" placeholder="Nome" leftSection={<IconBuilding></IconBuilding>} {...form.getInputProps("name")}></TextInput>
            <Button type="submit" color="yellow" leftSection={<IconEdit></IconEdit>}>Editar</Button>
        </form>
    )
}