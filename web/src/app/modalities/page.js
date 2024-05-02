'use client'
import Base from "@/components/Base/Base";
import Filters from "@/components/Filters/Filters";
import TablePagination from "@/components/TablePagination/TablePagination";
import Add from "./add/Add";
import Edit from "./edit/Edit";
import { Button, Modal, Flex, Text, Select, TextInput } from "@mantine/core";
import { IconEdit, IconFilter, IconPlus, IconTrash } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import api from "@/services/api";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";

export default function Modalities (){


    /* INÍCIO DO LOCAL PARA DEFINIÇÃO DE PALAVRAS CHAVES DAS PÁGINAS E COMPONENTES E SEUS RETORNOS*/

    let keywordView = "viewModalities";
    let keywordDel = "delModalities";
    let keywordAdd = "addModalities";
    let keywordEdit = "editModalities";

    const [rkeywordView, setRkeywordView] = useState(null);
    const [rkeywordDel, setRkeywordDel] = useState(null);
    const [rkeywordAdd, setRkeywordAdd] = useState(null);
    const [rkeywordEdit, setRkeywordEdit] = useState(null);

    /* FIM DO LOCAL PARA DEFINIÇÃO DE PALAVRAS CHAVES DAS PÁGINAS E COMPONENTES E SEUS RETORNOS*/

    const [modalities, setModalities] = useState([]);
    const [modalitiesTable, setModalitiesTable] = useState([]);
    const [selectedModality, setSelectedModality] = useState(null);

    const [modalAdd, modalAddHandlers] = useDisclosure(false, {onClose: ()=>{}, onOpen: ()=>{}});
    const [modalEdit, modalEditHandlers] = useDisclosure(false, {onClose: ()=>{}, onOpen: ()=>{}})

    const filterForm = useForm({
        initialValues: {
            id: "",
            name: "",
            type: ""
        }, validate: {
            id: (value)=>(new RegExp("^[0-9]").test(value) != true && value != null && value != "" ? "Esse campo só aceita números." : null)
        },
    })

    const getModalities = (values)=>{
        let path = "/modalities/select?";

        if(values != undefined){

            if(values.id != undefined && values.id != ""){
                path += `id=${values.id}&`;
            }
            if(values.name != undefined && values.name != ""){
                path += `name=${values.name}&`;
            }
            if(values.type != undefined && values.type != ""){
                path += `type=${values.type}&`;
            }
            
        }

        api.get(path).then((response)=>{

            if(response.data.length > 0){
                let aux = {};
                let arrayAux = [];
                response.data.forEach((modality)=>{
                    let actions = <Flex direction={"row"} gap="1vh"><Button color="red" leftSection={<IconTrash></IconTrash>} onClick={()=>{
                        openDeleteModal(modality.id);
                    }} disabled={!rkeywordDel}>Excluir</Button><Button color="yellow" onClick={()=>{setSelectedModality(modality.id);modalEditHandlers.open()}} leftSection={<IconEdit></IconEdit>} disabled={!rkeywordEdit}>Editar</Button></Flex>
                    aux = modality;
                    if(modality.type_marker == "goals"){
                        modality.type_marker = "Gols"
                    }
                    if(modality.type_marker == "points"){
                        modality.type_marker = "Pontos"
                    }
                    
                    if(modality.type == "individual"){
                        modality.type = "Individual"
                    }

                    if(modality.type == "collective"){
                        modality.type = "Coletivo"
                    }

                   

                    modality.actions = actions;

                    arrayAux.push(modality);
                })
                setModalitiesTable(arrayAux);
                setModalities(response.data);
            }else{
                setModalities(response.data);
                setModalitiesTable([{message: "Nenhuma modalidade encontrada."}]);
            }

        }).catch((error)=>{
            console.log(error);
            notifications.show({
                title: "Erro!",
                message: error.response.data.message,
                color: "red"
            })
        })
    }

    const deleteData = (id)=>{
        api.delete(`/modalities/delete/${id}`).then((response)=>{
            notifications.show({
                title: "Sucesso!",
                message: response.data.message,
                color: "green"
            })
        }).catch((error)=>{
            notifications.show({
                title: "Erro!",
                message: error.response.data.message,
                color: "red"
            })
        })
    }

    const openDeleteModal = (id)=>{
        modals.openConfirmModal({
            title: "Deletar modalidade",
            children: (
                <Text>
                    Você confirma a exclusão dessa modalidade? Essa ação não poderá ser desfeita.
                </Text>
            ),
            labels: {confirm: "Sim, confirmo.", cancel: "Não, cancelar."},
            onCancel: ()=>{},
            onConfirm: ()=>{deleteData(id);getModalities()},
            confirmProps: {color: "red"}
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
        if(rkeywordView == false){
            notifications.show({
                title: "Erro!",
                message: "Você não possui permissão para acessar essa página.",
                color: "red"
            })
            window.location.href = "/home";
        }
    },[rkeywordView])

    useEffect(()=>{
        getModalities();
     },[rkeywordAdd,rkeywordDel,rkeywordEdit,rkeywordView])

    useEffect(()=>{
        verifyPermissions();
    },[])

    return(<>
        <Base>
        <Modal opened={modalAdd} onClose={()=>{modalAddHandlers.close()}} title="Cadastrar modalidade">
            <Add close={()=>{modalAddHandlers.close()}} getModalities={()=>{getModalities()}}>

            </Add>
        </Modal>

        <Modal opened={modalEdit} onClose={()=>{modalEditHandlers.close()}} title="Editar modalidade">
            <Edit id={selectedModality} close={()=>{modalEditHandlers.close()}} getModalities={()=>{getModalities()}}>

            </Edit>
        </Modal>
            <div className="baseMain">
                <Filters title="Modalidades"
                onSubmit={filterForm.onSubmit((e)=>{getModalities(e)})}
                buttons={[<Button type="submit" color="blue" leftSection={<IconFilter></IconFilter>}>Filtrar</Button>,<Button onClick={()=>{modalAddHandlers.open()}} color="green" leftSection={<IconPlus></IconPlus>} disabled={!rkeywordAdd}>Cadastrar</Button>]}>
                    <TextInput label="ID" {...filterForm.getInputProps("id")}></TextInput>
                    <TextInput label="Nome" {...filterForm.getInputProps("name")}></TextInput>
                    <Select data={[{value: "collective", label: "Coletivo"},{value: "individual", label: "Individual"}]} label={"Tipo"} {...filterForm.getInputProps("type")}></Select>
                </Filters>
                <TablePagination data={modalitiesTable} head={["ID","Name","Tipo", "Marcador","Ações"]} numMaxRegsPags={20}></TablePagination>
            </div>
        </Base>
    </>)
}