'use client'

import { useState, useEffect } from "react";
import { Anchor, FileInput, Text, Button} from "@mantine/core";
import api from "@/services/api";
import { IconSend, IconUpload } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

export default function SendDoc(props){

    const form = useForm({
        initialValues: {
            user: sessionStorage.getItem("id"),
            doc: props.doc,
            file: null,
            formats: null
        },
        validate:{
            file: (value)=>(value == null ? 'Você deve selecionar um arquivo' : null),
        }
    })

    const [docInfos, setDocInfos] = useState({});

    useEffect(()=>{
        api.get(`/docs/select?doc=${props.doc}`).then((response)=>{
            setDocInfos(response.data);
            form.setValues({formats: response.data})
        }).catch((error)=>{
            console.log(error);
        })
    }, [])

    const sendData = (values)=>{

        //Fazendo o upload do arquivo.

        let formData = new FormData();
        formData.append("file", values.file);
        api.post(`/docs/archive?user=${values.user}&doc=${values.doc}&formats=${values.formats.type}`, formData,  {headers: {
            "Content-Type": `multipart/form-data;`,
            }}).then((response)=>{
            
                //Salvando o arquivo no banco de dados.
            let infos = values;
            infos.file = response.data.filename;
            api.post("/docs/save-archive", infos).then((response)=>{
                notifications.show({
                    title: "Sucesso",
                    message: "O documento foi enviado com sucesso!",
                    color: "green"
                });
                props.close();
            }).catch((error)=>{
                notifications.show({
                    title: "Erro",
                    message: error.response.data.message,
                    color: "red"
                })
            })

        }).catch((error)=>{
            notifications.show({
                title: "Erro",
                message: error.response.data.message,
                color: "red"
            })
        })
    }

    return(
        <>
            <form onSubmit={form.onSubmit((values)=>{sendData(values)})} enctype="multipart/form-data" method="post">
                <FileInput accept={docInfos.type} clearable radius={"xl"} leftSection={<IconUpload></IconUpload>} placeholder={"Documento"} {...form.getInputProps("file")}></FileInput>
                <Text size="xs"><Text span fw={700} inherit>Tipos de arquivos suportados: </Text> {docInfos.type}</Text>
                {(docInfos.example_link != null) ? (<Anchor size="xs" href={docInfos.example_link} target={"_blank"}>Exemplo do documento</Anchor>) : (null)}
                <Button type="submit" color="green" leftSection={<IconSend></IconSend>}>Enviar</Button>
            </form>
        </>
    )
}