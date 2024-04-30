'use client'
import { Tooltip, Flex, Button, Modal, Text, Anchor, TextInput, Select, Badge, Menu } from "@mantine/core";

import {useForm} from "@mantine/form";
import Base from "../../components/Base/Base.js";
import Filter from "../../components/Filters/Filters.js";
import { IconInfoCircleFilled, IconFilter, IconDownload, IconEdit, IconCircleDashedCheck, IconCircleDashedX, IconEye } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useDisclosure, useInputState } from "@mantine/hooks";
import { useEffect, useState } from "react";
import TablePagination from "../../components/TablePagination/TablePagination.js";
import api from "@/services/api";
import configUrl from "../../services/configUrl";
const dayjs = require("dayjs");

export default function Docs () {

    /* INÍCIO DO LOCAL PARA DEFINIÇÃO DE PALAVRAS CHAVES DAS PÁGINAS E COMPONENTES E SEUS RETORNOS*/

    let keywordView = "viewDocsAnalysis";

    const [rkeywordView, setRkeywordView] = useState(null);

    /* FIM DO LOCAL PARA DEFINIÇÃO DE PALAVRAS CHAVES DAS PÁGINAS E COMPONENTES E SEUS RETORNOS*/

    const verifyPermissions = ()=>{
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordView}`).then((response)=>{
            setRkeywordView(response.data.access);
        });

    }

    useEffect(()=>{
        if(rkeywordView == false){
            notifications.show({
                title: "Erro!",
                message: "Você não possui permissão para acessar essa página.",
                color: "red"
            })
            window.location.href = "/home";
        }
    },[rkeywordView])

    const filterForm = useForm({
        initialValues: {
            user_id: "",
            name: "",
            doc: "",
            status: "",
            date_creation: "",
            alphabetical_order: ""
        }, validate:{
            user_id: (value) => (((new RegExp("^[0-9]+$")).test(value) == true || value == "" || value == null) ? (null) : ('Esse campo só aceita números.')),
            date_creation: (value, values)=>(((values.alphabetical_order != "" && values.alphabetical_order != null) && (value != null && value != "") ? ('Só é possível selecionar uma forma de ordenação.') : (null))),
            alphabetical_order: (value, values)=>(((values.date_creation != "" && values.date_creation != null) && (value != null && value != "") ? ('Só é possível selecionar uma forma de ordenação.') : (null))),
        }
    });

    const [docsFilter, setDocsFilter] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null)
    const [docs, setDocs] = useState([]);
    const [docsTable, setDocsTable] = useState([]);
    const [description, setDescription] = useState("");
    const [modalRecuse, modalRecuseHandlers] = useDisclosure(false, {onClose: ()=>{}, onOpen: ()=>{}});
    let dataStatus = [{value: "waiting", label: "Em análise"},{value: "approved", label: "Aprovado"},{value: "recused", label: "Recusado"}];

    const getDocsFilter = ()=>{
        api.get("/docs/select").then((response)=>{
            let aux = [];
            let counter = 0;
            response.data.forEach((doc)=>{
                counter++;
                aux.push({value: `${doc.id}`, label: doc.name});
                if(counter == response.data.length){
                    setDocsFilter(aux);
                }
            })
        })
    }

    const getDocs = (values)=>{
        let path = "/docs/docs-users?";
        if(values != undefined){
            if(values.user_id != ""){
                path += `user_id=${values.user_id}&`;
            }
            if(values.user != ""){
                path += `user=${values.name}&`;
            }
            if(values.doc != "" && values.doc != null){
                path += `doc=${values.doc}&`;
            }
            if(values.status != "" && values.status != null){
                path += `status=${values.status}&`;
            }
            if(values.date_creation != "" && values.date_creation != null){
                path += `date_creation=${values.date_creation}&`;
            }
            if(values.alphabetical_order != "" && values.alphabetical_order != null){
                path += `alphabetical_order=${values.alphabetical_order}&`;
            }
        }
        

        api.get(path).then((response)=>{
            let aux = [];
            if(response.data.length > 0){
                setDocs(response.data)
                response.data.forEach((doc)=>{
                    let status = "";
                    let example_link = "";
                    let alter_status = null;
                    let date_creation = dayjs(doc.archive_date_creation).format("DD/MM/YYYY");

                    alter_status = <Menu>
                        <Menu.Target>
                            <Button color="yellow" leftSection={<IconEdit></IconEdit>}>Alterar status</Button>                            
                        </Menu.Target>
                        <Menu.Dropdown>
                        <Menu.Item onClick={()=>{openWaitingModal(doc.archive_id)}} leftSection={<IconEye></IconEye>}>
                                Em análise
                            </Menu.Item>
                            <Menu.Item onClick={()=>{openApprovedModal(doc.archive_id)}} leftSection={<IconCircleDashedCheck></IconCircleDashedCheck>}>
                                Aprovado
                            </Menu.Item>
                            <Menu.Item  onClick={()=>{setSelectedDoc(doc.archive_id);modalRecuseHandlers.open()}} leftSection={<IconCircleDashedX></IconCircleDashedX>}>
                                Recusado
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>;

                    if(doc.archive_status == "approved"){
                        status = <Badge color="green">Aprovado</Badge>;
                    }
                    if(doc.archive_status == "recused"){
                        status = <Flex direction={"row"} align={"center"}><Badge color="red">Recusado</Badge> <Tooltip label={doc.archive_status_description} multiline inline withArrow w={220}><IconInfoCircleFilled></IconInfoCircleFilled></Tooltip></Flex>;
                    }
                    if(doc.archive_status == "waiting"){
                        status = <Badge color="yellow">Aguardando análise</Badge>;
                    }
                    if(doc.doc_example_link != null && doc.doc_example_link != ""){
                        example_link = <Anchor href={doc.doc_example_link} target="_blank">Acessar documento de exemplo</Anchor>;
                    }else{
                        example_link = "Documento de exemplo não cadastrado."
                    }
                    aux.push({
                        id: doc.archive_id,
                        date_send: date_creation,
                        user: doc.user_name,
                        doc: <Flex direction={"row"} align={"center"}>{doc.doc_name} <Tooltip label={doc.doc_description} multiline inline withArrow w={220}><IconInfoCircleFilled size="15"></IconInfoCircleFilled></Tooltip></Flex>,
                        doc_example: example_link,
                        status: status,
                        actions: <Flex direction={"row"} gap={"1vh"}><Button component="a" target={"_blank"} href={"http://" + configUrl.ip+ ":" +configUrl.port+ "/user-docs/" +doc.archive_doc_path} color="blue" leftSection={<IconDownload></IconDownload>}>Baixar</Button>{alter_status}</Flex>
                    });
                });
                setDocsTable(aux);
            }else{
                setDocs(aux);
                setDocsTable([{message: "Nenhum documento encontrado."}])
            }
            
        }).catch((error)=>{
            console.log(error);
        })
    }

    const changeStatus = (doc,status, status_description)=>{
        let path = `/docs/change-status?status=${status}`;

        if(status_description != undefined){
            path += `&description=${status_description}`
        }
        api.put(path, {doc: doc, user: sessionStorage.getItem("id")}).then((response)=>{
            notifications.show({
                title: "Sucesso!",
                message: response.data.message,
                color: "green"
            });
            getDocs();
        }).catch((error)=>{
            notifications.show({
                title: "Erro!",
                message: error.response.data.message,
                color: "red"
            })
        })
    }

    const openApprovedModal = (doc)=>{
        modals.openConfirmModal({
            title: "Aprovar documento",
            centered: true,
            children: (<Text>
                Você confirma a aprovação desse documento? Vale ressaltar que um usuário com documentos aprovados recebe mais permissões dentro do sistema.
            </Text>),
            labels: {confirm: "Sim, confirmo.", cancel: "Não, cancelar."},
            onCancel: ()=>{},
            onConfirm: ()=>{changeStatus(doc,"approved")},
            confirmProps: {color: "green"}
        })
    }

    const openWaitingModal = (doc)=>{
        modals.openConfirmModal({
            title: "Documento em análise",
            centered: true,
            children: (<Text>
                Você confirma a alteração de status para "em análise" desse documento?
            </Text>),
            labels: {confirm: "Sim, confirmo.", cancel: "Não, cancelar."},
            onCancel: ()=>{},
            onConfirm: ()=>{changeStatus(doc,"waiting")},
            confirmProps: {color: "green"}
        })
    }

    const verifyDescription = (doc)=>{
        if(description.length > 0){
            changeStatus(doc,"recused",description);
            setDescription("");
            modalRecuseHandlers.close();
        }else{
            notifications.show({
                title: "Erro!",
                message:"É necessário preencher o campo 'Motivo'.",
                color: "red"
                });
        }
    }

    useEffect(()=>{
        verifyPermissions();
        getDocsFilter()
        getDocs();
    },[])

    return(
    <>
        <Base>
        <Modal title="Recusar documento" opened={modalRecuse}>
            <Flex direction={"column"} gap={"1vh"}>
            <TextInput label="Motivo" placeholder="Motivo da recusa" onChange={(e)=>{setDescription(e.currentTarget.value)}}></TextInput>
            <Text>
                Você confirma a recusa desse documento?
            </Text>
            <Button fullWidth color="red" onClick={()=>{
                verifyDescription(selectedDoc);
            }}>Recusar</Button>
            </Flex>
        </Modal>
            <div className="baseMain">
                <Filter
                title={<Flex direction={"row"} align={"center"}>Análise de documentos</Flex>}
                buttons={[<Button rightSection={<IconFilter></IconFilter>} type="submit" >Filtrar</Button>]}
                onSubmit={filterForm.onSubmit((values)=>{getDocs(values)})}
                >  
                    <TextInput label="ID do usuário" {...filterForm.getInputProps("user_id")}></TextInput>
                    <TextInput label="Nome" {...filterForm.getInputProps("name")}></TextInput>
                    <Select data={docsFilter} label="Documento" {...filterForm.getInputProps("doc")}></Select>
                    <Select data={dataStatus} label="Status" {...filterForm.getInputProps("status")}></Select>
                    <Select data={[{value: "old", label: "Do mais antigo para o mais recente"},{value: "new", label: "Do mais recente para o mais antigo"}]} label="Ordenar p/ data" {...filterForm.getInputProps("date_creation")}></Select>
                    <Select data={[{value: "yes", label: "Sim"},{value: "no", label: "Não"}]} label="Ordenar p/ ordem alfabética" {...filterForm.getInputProps("alphabetical_order")}></Select>
                 </Filter>
                <TablePagination data={docsTable} head={["ID","Data de envio","Nome do usuário","Documento","Exemplo","Status","Ações"]} numMaxRegsPags={20}></TablePagination>
            </div>
        </Base>
    </>
    )
}