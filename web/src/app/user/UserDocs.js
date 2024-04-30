'use client'
import {useEffect, useState} from "react";
import { Paper, Flex, Text, Badge, Button, Modal, Tooltip} from "@mantine/core"
import { IconDownload, IconInfoCircleFilled, IconEdit, IconTrash, IconSend } from "@tabler/icons-react"
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import api from "@/services/api";
import { notifications } from "@mantine/notifications";
import TablePagination from "../../components/TablePagination/TablePagination";
import SendDoc from "./Docs/Send/SendDoc";
import configUrl from "../../services/configUrl";
import EditDoc from "./Docs/Edit/EditDoc";

export default function UserDocs(){

    //Documentos que o sistema solicita.
    const [docsMandatory, setDocsMandatory] = useState([]);
    //Documentos que o usuário já enviou.
    const [docsUser, setDocsUser] = useState([]);

    //State usado para exibir na tela os documentos.
    const [docs, setDocs] = useState([]);

    const [selectedDoc, setSelectedDoc] = useState(null);
    const [defDoc, setDefDoc] = useState(null);

    const [modalAdd, modalAddHandlers] = useDisclosure(false,{onClose: ()=>{getDocs()}, onOpen:()=>{}})
    const [modalEdit, modalEditHandlers] = useDisclosure(false,{onClose: ()=>{getDocs()}, onOpen:()=>{}})


    const getDocs = ()=>{
        api.get("/docs/select").then((response)=>{
            setDocsMandatory(response.data);
            let aux = [];

            /* VARIÁVEIS PARA IF DE CONTROLE DE CONCLUSÃO DE REQUISIÇÕES */
            let assincCounter = 0;
            let numDocs = response.data.length;

            if(response.data.length == 0){
                setDocs([{message: "No momento o sistema não está exigindo nenhum documento."}]);
            }else{
                response.data.forEach((docMandatory)=>{
                    api.get(`/docs/doc-user?user=${sessionStorage.getItem("id")}&doc=${docMandatory.id}`).then((response)=>{
                        
                        assincCounter++;
                        let status = "";
                        let actions = null;
                        if(response.data.length > 0){
                            if(response.data[0].status == "approved"){
                                status = <Badge color="green">Aprovado</Badge>;
                                actions = [<Button component="a" target="_blank" href={'http://'+configUrl.ip+':'+configUrl.port+"/user-docs/"+response.data[0].doc_path} color="blue" leftSection={<IconDownload></IconDownload>}>Baixar</Button>,<Button leftSection={<IconEdit></IconEdit>} onClick={()=>{setDefDoc(docMandatory.id);setSelectedDoc(response.data[0].id);modalEditHandlers.open()}} color="yellow">Editar</Button>,<Button color="red" onClick={()=>{openDeleteModal(response.data[0].id)}} leftSection={<IconTrash></IconTrash>}>Excluir</Button>]
                            }
                            if(response.data[0].status == "waiting"){
                                status = <Badge color="orange">Em análise</Badge>;
                                actions = [<Button component="a" target="_blank" href={'http://'+configUrl.ip+':'+configUrl.port+"/user-docs/"+response.data[0].doc_path} color="blue" leftSection={<IconDownload></IconDownload>}>Baixar</Button>,<Button leftSection={<IconEdit></IconEdit>} onClick={()=>{setDefDoc(docMandatory.id);setSelectedDoc(response.data[0].id);modalEditHandlers.open()}} color="yellow">Editar</Button>,<Button color="red" onClick={()=>{openDeleteModal(response.data[0].id)}} leftSection={<IconTrash></IconTrash>}>Excluir</Button>]
                            }
                            if(response.data[0].status == "recused"){
                                status = <Flex direction={"row"} align={"center"}><Badge color="red">Recusado</Badge> <Tooltip label={response.data[0].status_description} multiline inline withArrow w={220}><IconInfoCircleFilled></IconInfoCircleFilled></Tooltip></Flex>;
                                actions = [<Button component="a" target="_blank" href={'http://'+configUrl.ip+':'+configUrl.port+"/user-docs/"+response.data[0].doc_path} color="blue" leftSection={<IconDownload></IconDownload>}>Baixar</Button>,<Button leftSection={<IconEdit></IconEdit>} onClick={()=>{setDefDoc(docMandatory.id);setSelectedDoc(response.data[0].id);modalEditHandlers.open()}} color="yellow">Editar</Button>,<Button color="red" onClick={()=>{openDeleteModal(response.data[0].id)}} leftSection={<IconTrash></IconTrash>}>Excluir</Button>]
                            }
                            aux.push({id: docMandatory.id, name: docMandatory.name, description: <Text w={200} truncate="end">{docMandatory.description}</Text>, status: status, actions: <div className="tableActions">{actions}</div>});
                        }else{
                            actions = [<Button onClick={()=>{setSelectedDoc(docMandatory.id);modalAddHandlers.open()}} color="green" leftSection={<IconSend></IconSend>}>Enviar</Button>]
                            aux.push({id: docMandatory.id, name: docMandatory.name, description: <Text w={200} truncate="end">{docMandatory.description}</Text>, status: <Badge color="gray">Não enviado</Badge>, actions: <div className="tableActions">{actions}</div>});
                        }

                        /* IF DE CONTROLE DE CONCLUSÃO DE REQUISIÇÕES - INÍCIO */
                        //Esse if eu fiz pois as requisições estavam terminando depois de o state docs ser exibido, então precisei criar esse sistema que só seta o state docs depois de todas as requisições serem cocluídas.
                        if(assincCounter == numDocs){
                            if(aux.length > 0){
                                aux.sort((a,b)=>{
                                    if(a.id < b.id){
                                        return -1;
                                    }
                                    if(a.id > b.id){
                                        return 1;
                                    }
                                    return 0;
                                })
                            }
                            setDocs(aux);
                        }
                        /* IF DE CONTROLE DE CONCLUSÃO DE REQUISIÇÕES - FIM */
                    }).catch((error)=>{
                        setDocs([{message: "No momento o sistema não está exigindo nenhum documento."}]);
                    })
                });
            }

        }).catch((error)=>{
            console.log(error);
            notifications.show(
                {
                    title: "Erro!",
                    message: error.response.data.message,
                    color: "red"
                }
            )
        })
    }

    const deleteData = (value)=>{
        api.delete(`/docs/archive/${value}`).then((response)=>{
            notifications.show({
                title: "Sucesso!",
                message: response.data.message,
                color: "green"
            });
        }).catch((error)=>{
            console.log(error)
            notifications.show({
                title: "Erro!",
                message: error.response.data.message,
                color: "red"
            });
        })
    }

    const openDeleteModal = (value) => {
        modals.openConfirmModal({
            title: "Deletar documento",
            centered: true,
            children: (
                <Text size="sm">
                    Você tem certeza que deseja deletar esse documento? Essa ação não poderá ser desfeita.
                </Text>
            ),
            labels: {confirm: "Deletar", cancel: "Não, eu não quero deletar"},
            confirmProps: {color: "red"},
            onCancel: ()=> {},
            onConfirm: ()=> {deleteData(value); getDocs()},
        })
    }

    useEffect(()=>{
        getDocs();
    },[]);

    return(
        <>
        <Modal title="Enviar documento" opened={modalAdd} onClose={modalAddHandlers.close}>
            <SendDoc doc={selectedDoc} close={modalAddHandlers.close}></SendDoc>
        </Modal>
        <Modal title="Editar documento" opened={modalEdit} onClose={modalEditHandlers.close}>
            <EditDoc defDoc={defDoc} doc={selectedDoc} close={modalEditHandlers.close}></EditDoc>
        </Modal>
        <Paper p={"1vh"}>
            <Flex direction={"column"} gap={"1vh"}>
            <TablePagination data={docs} head={["ID","Nome","Descrição","Status","Ações"]} numMaxRegsPags={20}></TablePagination>
            </Flex>
        </Paper>
        </>
    )
}