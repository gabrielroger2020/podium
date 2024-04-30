'use client'
import api from "@/services/api";
import { TextInput, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconBuilding, IconPlus } from "@tabler/icons-react";

export default function Add(props){

    const form = useForm({
        initialValues: {
            user_creator: sessionStorage.getItem("id"),
            name: ""
        }, validate: {
            name: (value)=>(value.length > 0 ? null : 'Esse campo precisa ter no mínimo 1 catactere.')
        }
    })

    const sendData = (values)=>{
        api.post("/entities/category/register", values).then((response)=>{
            

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
            <Button type="submit" color="green" leftSection={<IconPlus></IconPlus>}>Cadastrar</Button>
        </form>
    )
}