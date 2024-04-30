'use client'

import { useState, useEffect } from "react";
import { Anchor, FileInput, Text, Button, Badge, Flex, Tooltip} from "@mantine/core";
import api from "@/services/api";
import { IconInfoCircleFilled, IconSend, IconUpload } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import configUrl from "@/services/configUrl";

export default function SendImage(props){

    const form = useForm({
        initialValues: {
            user: sessionStorage.getItem("id"),
            entity: props.entity,
            file: null,
            formats: ".jpg,.jpeg,.png"
        },
        validate:{
            file: (value)=>(value == null ? 'Você deve selecionar um arquivo' : null),
        }
    })

    const [docInfos, setDocInfos] = useState({});

    useEffect(()=>{
        getShield();
    }, [])

    const sendData = (values)=>{

        //Fazendo o upload do arquivo.

        let formData = new FormData();
        formData.append("file", values.file);
        api.post(`/entities/image-entity?entity=${values.entity}`, formData,  {headers: {
            "Content-Type": `multipart/form-data;`,
            }}).then((response)=>{
            
                //Salvando o arquivo no banco de dados.
            let infos = values;
            infos.file = response.data.filename;
            api.post("/entities/save-image-entity", infos).then((response)=>{
                notifications.show({
                    title: "Sucesso",
                    message: "A imagem foi salva com sucesso.!",
                    color: "green"
                });
                props.close();
            }).catch((error)=>{
                console.log(error)
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

    const getShield = ()=>{
        api.get(`/entities/shield-image/${form.values.entity}`).then((response)=>{

            console.log(response)

            let aux = response.data;

            if(response.data.status_image == "waiting"){
                aux.status = <Badge color="yellow">Em análise</Badge>
            }

            if(response.data.status_image == "approved"){
                aux.status = <Badge color="green">Aprovado</Badge>
            }

            if(response.data.status_image == "recused"){
                aux.status = <Flex direction={"row"} align={"center"}><Badge color="yellow">Recusado</Badge> <Tooltip label={aux.status_description}><IconInfoCircleFilled></IconInfoCircleFilled></Tooltip></Flex>
            }

            if(response.data.image == null){
                aux.status = <Badge color="grey">Não enviado</Badge>
            }

            setDocInfos(aux);
        }).catch((error)=>{
            notifications.show({
                title: "Erro!",
                message: "Não foi possível selecionar o escudo da entidade.",
                color: "red"
            })
        })
    }

    return(
        <>
            <form onSubmit={form.onSubmit((values)=>{sendData(values)})} enctype="multipart/form-data" method="post">
                <FileInput accept={form.values.formats} clearable radius={"xl"} leftSection={<IconUpload></IconUpload>} placeholder={"Documento"} {...form.getInputProps("file")}></FileInput>
                <Text size="xs"><Text span fw={700} inherit>Tipos de arquivos suportados: </Text> {form.values.formats}</Text>
                {docInfos.image != null ? (<Text><Anchor target="_blank" href={'http://'+configUrl.ip+':'+configUrl.port+"/entity-shields/"+ docInfos.image}>Escuto atual</Anchor></Text>):(null)}
                <Text size="xs"><Text span fw={700} inherit>Status: </Text> {docInfos.status}</Text>
                {(docInfos.status == "recused") ? (docInfos.status_description) : (null)}
                <Button type="submit" color="green" leftSection={<IconSend></IconSend>}>Enviar</Button>
            </form>
        </>
    )
}