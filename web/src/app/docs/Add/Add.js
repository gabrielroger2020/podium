'use client'
import { TextInput, Select, MultiSelect, Flex, Button } from "@mantine/core";
import {IconFileInfo, IconFileDescription, IconFileDots, IconCalendar, IconPlus, IconLink} from "@tabler/icons-react";
import {useForm} from "@mantine/form";
import api from "@/services/api";
import { notifications } from "@mantine/notifications";

export default function Add(props){

    const dataTypeArchive = [{group: "Imagens", items: [".png",".jpg"]}, {group: "Documentos", items: [".pdf",".docx"]}, {group: "Compactados", items: [".zip",".rar"]}]

    const form = useForm({
        initialValues: {
            user_creator: sessionStorage.getItem("id"),
            name: "",
            description: "",
            type: [],
            validity: "",
            validity_type: "days",
            example_link: ""
        }, validate:{
            name: (value)=>(value.length < 3 ? 'Esse campo deve ter no mínimo 3 caracteres.' : null),
            description: (value)=>(value.length < 10 ? 'Esse campo deve ter no mínimo 10 caracteres.' : null),
            type: (value)=>(value.length < 1 ? 'Esse campo deve ter no mínimo uma opção selecionada.' : null),
            validity: (value)=>((new RegExp("^[0-9]+$")).test(value) == false ? 'Esse campo deve ser preenchido somente com números e não pode estar vazio.' : null),
            validity_type: (value)=>(value == null ? 'Esse campo deve ter no mínimo uma opção selecionada.' : null),
            example_link: (value)=>((new RegExp("https?:\/\/[^\s]+")).test(value) == true || value == "" || value == null ? null : 'Esse campo deve ser preenchido com um link que se inicia com HTTPS:// ou HTTP:// .'),
        }
    })

    const sendData = (values)=>{
        api.post("/docs/register",values).then((response)=>{
            notifications.show({
                title: "Sucesso!",
                message: response.data.message,
                color: "green"
            });
            props.onClose();
        }).catch((error)=>{
            notifications.show({
                title: "Erro!",
                message: error.response.data.message,
                color: "red"
            });
            
        })
    }

    return(<>
        <form onSubmit={form.onSubmit((values)=>{sendData(values)})}>
            <TextInput radius="xl" leftSection={<IconFileInfo></IconFileInfo>} placeholder="Nome" {...form.getInputProps("name")}></TextInput>
            <TextInput radius="xl" leftSection={<IconFileDescription></IconFileDescription>} placeholder="Descrição" {...form.getInputProps("description")}></TextInput>
            <MultiSelect data={dataTypeArchive} radius="xl" leftSection={<IconFileDots></IconFileDots>} placeholder="Tipos de arquivos" {...form.getInputProps("type")}></MultiSelect>
            <Flex direction={"row"} gap={"1vh"}>
                <TextInput radius="xl"  placeholder="Validade" leftSection={<IconCalendar></IconCalendar>} {...form.getInputProps("validity")}></TextInput>
                <Select radius="xl" placeholder="Tipo" data={[{value: "days", label: "Dias"},{value: "months", label: "Meses"},{value: "years", label: "Anos"}]} leftSection={<IconCalendar></IconCalendar>} {...form.getInputProps("validity_type")}></Select>
            </Flex>
            <TextInput radius="xl" leftSection={<IconLink></IconLink>} placeholder="Link do arquivo de exemplo" {...form.getInputProps("example_link")}></TextInput>
            <Button type="submit" color={"green"} leftSection={<IconPlus></IconPlus>}>
                Cadastrar
            </Button>
        </form>
    </>)
}