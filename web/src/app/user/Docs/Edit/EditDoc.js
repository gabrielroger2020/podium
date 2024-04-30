'use client'

import { useState, useEffect } from "react";
import { Anchor, FileInput, Text, Button} from "@mantine/core";
import api from "@/services/api";
import { IconEdit, IconUpload } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import configUrl from "../../../../services/configUrl";

export default function EditDoc(props){

    const form = useForm({
        initialValues: {
            user: sessionStorage.getItem("id"),
            doc: props.doc,
            defDoc: props.defDoc,
            file: null,
            formats: null,
            filename_previous: null
        },
        validate:{
            file: (value)=>(value == null ? 'Você deve selecionar um arquivo' : null),
        }
    })

    const [docInfos, setDocInfos] = useState({});
    const [userDocInfos, setUserDocInfos] = useState({});

    useEffect(()=>{
        api.get(`/docs/doc-user?doc=${props.defDoc}&user=${sessionStorage.getItem("id")}`).then((response)=>{
            if(response.data.length > 0){
                setUserDocInfos(response.data[0]);
                form.setValues({filename_previous: response.data[0].doc_path});
                api.get(`/docs/select?doc=${response.data[0].doc_id}`).then((response)=>{
                    setDocInfos(response.data);
                    form.setValues({formats: response.data})
                }).catch((error)=>{
                    notifications.show({
                        title: "Erro!",
                        message: "Não foi possível localizar as informações sobre o documento.",
                        color: "red"
                    })
                    props.close();
                })
            }
        }).catch((error)=>{
            console.log(error);
        })
    }, [])

    const sendData = (values)=>{

        //Fazendo o upload do arquivo.

        let formData = new FormData();
        formData.append("file", values.file);
        console.log(values.formats);
        api.post(`/docs/archive?user=${values.user}&doc=${values.doc}&formats=${values.formats.type}`, formData,  {headers: {
            "Content-Type": `multipart/form-data;`,
            }}).then((response)=>{
            
            //Salvando o arquivo no banco de dados.
            let infos = values;
            infos.file = response.data.filename;
            api.put("/docs/edit-archive", infos).then((response)=>{
                console.log(response);
                notifications.show({
                    title: "Sucesso",
                    message: response.data.message,
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
                <Anchor size="xs" href={'http://'+configUrl.ip+':'+configUrl.port+"/user-docs/"+ userDocInfos.doc_path} target={"_blank"}>Documento atual</Anchor>
                {(docInfos.example_link != null) ? (<Anchor size="xs" href={docInfos.example_link} target={"_blank"}>Exemplo do documento</Anchor>) : (null)}
                <Button type="submit" color="yellow" leftSection={<IconEdit></IconEdit>}>Editar</Button>
            </form>
        </>
    )
}