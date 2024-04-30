'use client'
import { Tooltip, Flex, Button, Modal, Text, Anchor, TextInput, Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {useForm} from "@mantine/form";
import Base from "../../components/Base/Base";
import Filter from "../../components/Filters/Filters.js";
import { IconInfoCircleFilled, IconPlus, IconCalendarEvent, IconFilter } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import Add from "./Add/Add.js";
import Edit from "./Edit/Edit.js";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import TablePagination from "../../components/TablePagination/TablePagination";
import api from "@/services/api";
import { IconTrash, IconEdit } from "@tabler/icons-react";
const dayjs = require("dayjs");

export default function Docs () {

    /* INÍCIO DO LOCAL PARA DEFINIÇÃO DE PALAVRAS CHAVES DAS PÁGINAS E COMPONENTES E SEUS RETORNOS*/

    let keywordView = "viewDocs";
    let keywordDel = "delDocs";
    let keywordAdd = "addDocs";
    let keywordEdit = "editDocs";

    const [rkeywordView, setRkeywordView] = useState(null);
    const [rkeywordDel, setRkeywordDel] = useState(null);
    const [rkeywordAdd, setRkeywordAdd] = useState(null);
    const [rkeywordEdit, setRkeywordEdit] = useState(null);

    /* FIM DO LOCAL PARA DEFINIÇÃO DE PALAVRAS CHAVES DAS PÁGINAS E COMPONENTES E SEUS RETORNOS*/

    const filterForm = useForm({
        initialValues: {
            name: "",
            description: "",
            validity_type: "",
            example_link: "",
            date_creation: "",
            date_alter: ""
        }
    });

    const [modalAdd, modalAddHandlers] = useDisclosure(false,{onOpen: ()=>{}, onClose: ()=>{getDocs()}});
    const [modalEdit, modalEditHandlers] = useDisclosure(false,{onOpen: ()=>{}, onClose: ()=>{getDocs()}});
    const [selectedDoc, setSelectedDoc] = useState(null)
    const [docs, setDocs] = useState([]);

    const dateCreationSelect = (value)=>{
        filterForm.setValues({date_creation: value})
    }

    const dateAlterSelect = (value)=>{
        filterForm.setValues({date_alter: value})
    }

    const getDocs = (values)=>{
        if(values == undefined || (values.name == "" && values.description == "" && values.validity_type == "" && values.example_link == "" && values.date_creation == "" && values.date_alter == "")){
            
            api.get("/docs/select/").then((response)=>{
                let aux = [];
                response.data.forEach((element)=>{
                    let example_link = element.example_link;
                    if(example_link != null && example_link != ""){
                        example_link = <Anchor href={example_link} target="_blank">Acessar documento</Anchor>;
                    }else{
                        example_link = "Documento de exemplo não cadastrado."
                    }
                    console.log(response)
                    aux.push({id: element.id, name: element.name, description: <Text w={100} truncate="end">{element.description}</Text>, type: element.type, validity: element.validity, validity_type: element.validity_type, example_link: example_link,date_creation: element.date_creation, actions: <div className="tableActions"><Button size="xs" onClick={(button)=>{openDeleteModal(element.id)}} color="red" leftSection={<IconTrash></IconTrash>} disabled={!rkeywordDel} >Deletar</Button><Button size="xs" onClick={()=>{setSelectedDoc(element.id); modalEditHandlers.open();}} color="yellow" leftSection={<IconEdit></IconEdit>} disabled={!rkeywordEdit}>Editar</Button></div>})
                })
    
                setDocs(aux)
            }).catch((error)=>{
                console.log(error);
            })
        }else{
            let query = "";

            if(values.name.length > 0){
                query += `name=${values.name}&`;
            }

            if(values.description.length > 0){
                query += `description=${values.description}&`;
            }

            if(values.validity_type != null && values.validity_type.length > 0){
                query += `validity_type=${values.validity_type}&`;
            }

            if(values.example_link != null && values.example_link.length > 0){
                query += `example_link=${values.example_link}&`;
            }

            if(values.date_creation.length > 0 && values.date_creation[0] != null){
                query += `date_creation_ini=${dayjs(values.date_creation[0]).format("YYYY-MM-DD")}&date_creation_end=${dayjs(values.date_creation[1]).format("YYYY-MM-DD")}&`;
            }

            if(values.date_alter.length > 0 && values.date_alter[0] != null){
                query += `date_alter_ini=${dayjs(values.date_alter[0]).format("YYYY-MM-DD")}&date_alter_end=${dayjs(values.date_alter[1]).format("YYYY-MM-DD")}`;
            }

            api.get(`/docs/select?${query}`).then((response)=>{
                let aux = [];
                if(response.data.length > 0){
                    
                    response.data.forEach((element)=>{
                    let example_link = element.example_link;
                    if(example_link != null && example_link != ""){
                        example_link = <Anchor href={example_link} target="_blank">Acessar documento</Anchor>;
                    }else{
                        example_link = "Documento de exemplo não cadastrado."
                    }
                    aux.push({id: element.id, name: element.name, description: <Text w={100} truncate="end">{element.description}</Text>, type: element.type, validity: element.validity, validity_type: element.validity_type, example_link: example_link,date_creation: element.date_creation, actions: <div className="tableActions"><Button size="xs" onClick={(button)=>{openDeleteModal(element.id)}} color="red" leftSection={<IconTrash></IconTrash>} disabled={!rkeywordDel} >Deletar</Button><Button size="xs" onClick={()=>{setSelectedDoc(element.id); modalEditHandlers.open();}} color="yellow" leftSection={<IconEdit></IconEdit>} disabled={!rkeywordEdit}>Editar</Button></div>})
                    })
                }else{
                    aux.push({message: "Nenhum usuário encontrado!"});
                }
                setDocs(aux)
                
            }).catch((error)=>{
                console.log(error);
            })
        }
        
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

    const deleteData = (value)=>{
        api.delete(`/docs/delete/${value}`).then((response)=>{
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

    const verifyPermissions = ()=>{
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordView}`).then((response)=>{
            setRkeywordView(response.data.access);
        });
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordAdd}`).then((response)=>{
            setRkeywordAdd(response.data.access);
        });
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordDel}`).then((response)=>{
            setRkeywordDel(response.data.access);
        });
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordEdit}`).then((response)=>{
            setRkeywordEdit(response.data.access);
        });

    }

    useEffect(()=>{
        verifyPermissions();
    },[])

    useEffect(()=>{
        getDocs();
    }, [rkeywordAdd,rkeywordDel,rkeywordEdit,rkeywordView]);

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

    return(
    <>
        <Modal opened={modalAdd} title="Cadastrar documento" onClose={modalAddHandlers.close}>
            <Add onClose={()=>{modalAddHandlers.close()}} getDocs={getDocs}></Add>
        </Modal>
        <Modal opened={modalEdit} title="Editar documento" onClose={modalEditHandlers.close}>
            <Edit doc={selectedDoc} onClose={()=>{modalEditHandlers.close()}} getDocs={getDocs}></Edit>
        </Modal>
        <Base>
            <div className="baseMain">
                <Filter
                title={<Flex direction={"row"} align={"center"}>Documentos <Tooltip label="Essa página refere-se aos documentos obrigatórios para o cadastro de cada usuário." multiline inline withArrow w={220}><IconInfoCircleFilled></IconInfoCircleFilled></Tooltip></Flex>}
                buttons={[<Button rightSection={<IconFilter></IconFilter>} type="submit" >Filtrar</Button>,<Button color="green" leftSection={<IconPlus></IconPlus>} onClick={modalAddHandlers.open} disabled={!rkeywordAdd}>Cadastrar</Button>]}
                onSubmit={filterForm.onSubmit((values)=>{getDocs(values)})}
                >
                <TextInput label="Nome" {...filterForm.getInputProps("name")}></TextInput>
                <TextInput label="Descrição" {...filterForm.getInputProps("description")}></TextInput>
                <Select label="Tipo de validade" data={[{value: "days", label: "Dias"},{value: "months", label: "Meses"},{value: "years", label: "Anos"}]} {...filterForm.getInputProps("validity_type")}></Select>
                <Select label="Exemplo" data={[{value: "yes", label: "Sim"},{value: "no", label: "Não"}]} {...filterForm.getInputProps("example_link")}></Select>
                <DatePickerInput className="dateBirthInput" w={"calc(12.938rem * var(--mantine-scale)"} type="range" label={"Data de criação"} rightSection={<IconCalendarEvent></IconCalendarEvent>} onChange={(d)=>dateCreationSelect(d)}></DatePickerInput>
                <DatePickerInput className="dateBirthInput" w={"calc(12.938rem * var(--mantine-scale)"} type="range" label={"Data de alteração"} rightSection={<IconCalendarEvent></IconCalendarEvent>} onChange={(d)=>dateAlterSelect(d)}></DatePickerInput>
                 </Filter>
                <TablePagination data={docs} head={["ID","Nome","Descrição","Tipo","Validade","Tipo de validade","Exemplo", "Data de Criação","Ações"]} numMaxRegsPags={20}></TablePagination>
            </div>
        </Base>
    </>
    )
}