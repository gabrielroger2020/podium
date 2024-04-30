'use client'
import api from "@/services/api";
import Base from "../../components/Base/Base.js";
import Filter from "../../components/Filters/Filters.js";
import {Button, Modal, Text, Flex, TextInput, Select} from "@mantine/core";
import { modals } from "@mantine/modals";
import { useDisclosure } from "@mantine/hooks";
import {IconPlus, IconTrash, IconEdit, IconEye, IconFilter, IconUsersGroup} from "@tabler/icons-react";
import {useEffect, useState} from "react";
import TablePagination from "../../components/TablePagination/TablePagination.js";
import Add from "./add/Add.js";
import Edit from "./edit/Edit.js";
import View from "./view/View.js";
import Managers from "./managers/Managers.js"
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";

export default function Entities(){

    /* INÍCIO DO LOCAL PARA DEFINIÇÃO DE PALAVRAS CHAVES DAS PÁGINAS E COMPONENTES E SEUS RETORNOS*/

    let keywordView = "viewEntities";
    let keywordDel = "delEntities";
    let keywordAdd = "addEntities";
    let keywordEdit = "editEntities";
    let keywordManagers = "managersEntities";

    const [rkeywordView, setRkeywordView] = useState(null);
    const [rkeywordDel, setRkeywordDel] = useState(null);
    const [rkeywordAdd, setRkeywordAdd] = useState(null);
    const [rkeywordEdit, setRkeywordEdit] = useState(null);
    const [rkeywordManagers, setRkeywordManagers] = useState(null);

    /* FIM DO LOCAL PARA DEFINIÇÃO DE PALAVRAS CHAVES DAS PÁGINAS E COMPONENTES E SEUS RETORNOS*/

    const [openedModalAdd, {open, close}] = useDisclosure(false);
    const [openedModalEdit, modalEditHandlers] = useDisclosure(false, {onOpen: ()=>{}, onClose: ()=>{}})
    const [openedModalView, modalViewHandlers] = useDisclosure(false, {onClose: ()=>{}, onOpen: ()=>{}});
    const [openedModalManagers, modalManagersHandlers] = useDisclosure(false, {onOpen: ()=>{}, onClose: ()=>{}});
    const [cateogiriesEntities, setCateogiriesEntities] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [entities, setEntities] = useState([]);
    const [entitiesTable, setEntitiesTable] = useState([]);
    const [selectedEntity, setSelectedEntity] = useState(null);

    const filterForm = useForm({initialValues:{
        id: "",
        name: "",
        category: ""
    }, validate:{
        id: (value)=>(new RegExp("^[0-9]").test(value) != true && value != null && value != "" ? "Esse campo só aceita números." : null)
    }});

    const openDeleteModal = (value) => {
        modals.openConfirmModal({
            title: "Deletar entidade",
            centered: true,
            children: (
                <Text size="sm">
                    Você tem certeza que deseja deletar essa entidade? Todos os históricos dessa entidade também serão deletados. Essa ação não poderá ser desfeita.
                </Text>
            ),
            labels: {confirm: "Deletar", cancel: "Não, eu não quero deletar"},
            confirmProps: {color: "red"},
            onCancel: ()=> {},
            onConfirm: ()=> deleteData(value)
        })
    }

    const deleteData = (value)=>{
        api.delete(`/entities/delete/${value}`).then((response)=>{
            getAllEntities();
            notifications.show({
                title: "Sucesso!",
                message: response.data.message,
                color: "green"
            });
        }).catch((error)=>{
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
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordManagers}`).then((response)=>{
            setRkeywordManagers(response.data.access);
        });

    }

    const getAllCategoriesEntities = ()=>{
        api.get("/entities/category/select").then((response)=>{
            let aux = [];
            if(response.data.length > 0){
                response.data.forEach((category)=>{
                    aux.push({value: `${category.id}`, label: `${category.name}`})
                })
                setCateogiriesEntities(aux);
            }else{
                setCateogiriesEntities([{message: "Não encontramos nenhuma categoria de entidade."}]);
            }

        }).catch((error)=>{
            setCateogiriesEntities([{message: "Não encontramos nenhuma categoria de entidade."}]);
        })
    }

    const getAllEntities = (values)=>{

        let path = "/entities/select?";

        if(values != undefined){
            if(values.id != "" && values.id != null){
                path += `id=${values.id}&`;
            }
            if(values.name != "" && values.name != null){
                let name = "%" + values.name + "%";
                path += `name=${values.name}&`;
            }
            if(values.category != "" && values.category != null){
                path += `category=${values.category}&`;
            }
        }

        api.get(path).then((response)=>{
            let aux = [];
            setEntities(response.data);
            response.data.forEach((entity)=>{
                let actions = <Flex gap="1vh"><Button onClick={()=>{setSelectedEntity(entity.id);modalViewHandlers.open()}} leftSection={<IconEye></IconEye>} disabled={!rkeywordView}>Ver mais</Button><Button onClick={()=>{openDeleteModal(entity.id)}} leftSection={<IconTrash></IconTrash>} color="red" disabled={!rkeywordDel}>Excluir</Button><Button onClick={()=>{
                    setSelectedEntity(entity.id);
                    modalEditHandlers.open();
                }}leftSection={<IconEdit></IconEdit>} color="yellow" disabled={!rkeywordEdit}>Editar</Button>
                <Button onClick={()=>{setSelectedEntity(entity.id);modalManagersHandlers.open()}} leftSection={<IconUsersGroup></IconUsersGroup>} disabled={!rkeywordManagers}>Gerentes</Button></Flex>
                aux.push({id: entity.id, name: entity.name_official, category: entity.category_name, email: entity.email, actions: actions});
            })
            setEntitiesTable(aux);
        }).catch((error)=>{
            setEntitiesTable([{message: "Nenhum entidade encontrada."}]);
        })

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
        verifyPermissions();
        getAllCategoriesEntities();
    },[])

    useEffect(()=>{
        getAllEntities();
    },[rkeywordAdd,rkeywordDel,rkeywordEdit,rkeywordView])

    return(<>
    <Base>
        <Modal opened={openedModalAdd} onClose={close} title="Cadastrar entidade">
            <Add closeModal={close} getAllEntities={getAllEntities}></Add>
        </Modal>
        <Modal opened={openedModalEdit} onClose={()=>{modalEditHandlers.close()}} title="Editar entidade">
            <Edit id={selectedEntity} closeModal={()=>{modalEditHandlers.close()}} getAllEntities={getAllEntities}></Edit>
        </Modal>
        <Modal opened={openedModalView} onClose={()=>{modalViewHandlers.close()}} size="auto">
            <View id={selectedEntity}>

            </View>
        </Modal>
        <Modal opened={openedModalManagers} onClose={()=>{modalManagersHandlers.close()}} title="Gerenciar Gerentes">
            <Managers id={selectedEntity} close={()=>{modalManagersHandlers.close()}}>

            </Managers>
        </Modal>
        <div className="baseMain">
            <Filter
                onSubmit={filterForm.onSubmit((e)=>{getAllEntities(e)})}
                title="Cadastro de entidades"
                buttons={[<Button color="blue" rightSection={<IconFilter></IconFilter>} type="submit">Filtrar</Button>,<Button color="green" getAllEntities={()=>{getAllEntities()}} rightSection={<IconPlus></IconPlus>} onClick={open} disabled={!rkeywordAdd}>Cadastrar</Button>]}>
                <TextInput label="ID" {...filterForm.getInputProps("id")}></TextInput>
                <TextInput label="Nome oficial" {...filterForm.getInputProps("name")}></TextInput>
                <Select data={cateogiriesEntities} label="Categoria" {...filterForm.getInputProps("category")}></Select>
            </Filter>
            <TablePagination data={entitiesTable} head={["ID", "Nome", "Categoria", "E-mail" ,"Ações"]} numMaxRegsPags={20}/>
        </div>
    </Base>
    </>)
}