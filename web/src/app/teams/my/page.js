'use client'
import Base from "@/components/Base/Base";
import Filters from "@/components/Filters/Filters";
import TablePagination from "@/components/TablePagination/TablePagination";
import Add from "./add/Add";
import Edit from "./edit/Edit";
import Managers from "./managers/Managers";
import { Button, Modal, Flex, Text, Select, TextInput } from "@mantine/core";
import { IconEdit, IconFilter, IconPlus, IconTrash, IconUsersGroup } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import api from "@/services/api";
import View from "./athletes/view/View"
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";

export default function Teams (){


    /* INÍCIO DO LOCAL PARA DEFINIÇÃO DE PALAVRAS CHAVES DAS PÁGINAS E COMPONENTES E SEUS RETORNOS*/

    let keywordView = "viewMyTeamsManagers";
    let keywordDel = "delMyTeamsManagers";
    let keywordAdd = "addMyTeamsManagers";
    let keywordEdit = "editMyTeamsManagers";
    let keywordAthletes = "athletesMyTeamsManagers";

    const [rkeywordView, setRkeywordView] = useState(null);
    const [rkeywordDel, setRkeywordDel] = useState(null);
    const [rkeywordAdd, setRkeywordAdd] = useState(null);
    const [rkeywordEdit, setRkeywordEdit] = useState(null);
    const [rkeywordAthletes, setRkeywordAthletes] = useState(null);

    /* FIM DO LOCAL PARA DEFINIÇÃO DE PALAVRAS CHAVES DAS PÁGINAS E COMPONENTES E SEUS RETORNOS*/

    const [modalitiesTable, setModalitiesTable] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [teams, setTeams] = useState([]);
    const [teamsTable, setTeamsTable] = useState([]);

    const [modalAdd, modalAddHandlers] = useDisclosure(false, {onClose: ()=>{}, onOpen: ()=>{}});
    const [modalEdit, modalEditHandlers] = useDisclosure(false, {onClose: ()=>{}, onOpen: ()=>{}})
    const [modalManagers, modalManagersHandlers] = useDisclosure(false, {onClose: ()=>{}, onOpen: ()=>{}});
    const [modalAthletes, modalAthletesHandlers] = useDisclosure(false, {onClose: ()=>{}, onOpen: ()=>{}});

    const [modalities, setModalities] = useState([]);
    const [entities, setEntities] = useState([]);

    const filterForm = useForm({
        initialValues: {
            id: "",
            name: "",
            entity: "",
            modality: ""
        }, validate: {
            id: (value)=>(new RegExp("^[0-9]").test(value) != true && value != null && value != "" ? "Esse campo só aceita números." : null)
        },
    })

    const getTeams = (values)=>{
        let path = `/teams/select?user_id=${sessionStorage.getItem("id")}&`;

        if(values != undefined){

            if(values.id != undefined && values.id != ""){
                path += `id=${values.id}&`;
            }
            if(values.name != undefined && values.name != ""){
                path += `name=${values.name}&`;
            }
            if(values.entity != undefined && values.entity != ""){
                path += `entity=${values.entity}&`;
            }
            if(values.modality != undefined && values.modality != ""){
                path += `modality=${values.modality}&`;
            }
            
        }

        api.get(path).then((response)=>{

            if(response.data.length > 0){
                let aux = {};
                let arrayAux = [];
                response.data.forEach((team)=>{
                    let actions = <Flex direction={"row"} gap="1vh"><Button color="red" leftSection={<IconTrash></IconTrash>} onClick={()=>{
                        openDeleteModal(team.id);
                    }} disabled={!rkeywordDel}>Excluir</Button><Button color="yellow" onClick={()=>{setSelectedTeam(team.id);modalEditHandlers.open()}} leftSection={<IconEdit></IconEdit>} disabled={!rkeywordEdit}>Editar</Button>
                    <Button onClick={()=>{
                        setSelectedTeam(team.id);
                        modalAthletesHandlers.open();
                    }}leftSection={<IconUsersGroup></IconUsersGroup>} color="blue" disabled={!rkeywordAthletes}>Atletas</Button></Flex>
                    aux = {id: team.id, name: team.name, entity: team.entity_name, modality: team.modality_name, actions: actions};

                    arrayAux.push(aux);
                })
                setTeamsTable(arrayAux);
                setTeams(response.data);
            }else{
                setTeams(response.data);
                setTeamsTable([{message: "Nenhuma equipe encontrada."}]);
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

    //Consultando todas as modalidas para alimentar select.
    const getModalities = ()=>{
        api.get("/modalities/select").then((response)=>{

            let aux = []
            response.data.forEach((modality)=>{
                aux.push({value: `${modality.id}`, label: modality.name});
            })

            setModalities(aux);

        }).catch((error)=>{
            notifications.show({
                title: "Erro!",
                message: "Não foi possível selecionarmos as modalidades",
                color: "red"
            })
        })
    }

    //Consultando todas as entidades para alimentar select.
    const getEntities = ()=>{

        let path = "/entities/select?";

        if(window.location.pathname != "/teams"){
            path += `user_id${sessionStorage.getItem("id")}`;
        }

        api.get(path).then((response)=>{

            let aux = [];

            response.data.forEach((entity)=>{
                aux.push({value: `${entity.id}`, label: entity.name_official});
            });

            setEntities(aux);

        }).catch((error)=>{
            notifications.show({
                title: "Erro!",
                message: "Não foi possível selecionarmos as entidades",
                color: "red"
            })
        })
    }

    const deleteData = (id)=>{
        api.delete(`/teams/delete/${id}`).then((response)=>{
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
            title: "Deletar equipe",
            children: (
                <Text>
                    Você confirma a exclusão dessa equipe? Essa ação não poderá ser desfeita.
                </Text>
            ),
            labels: {confirm: "Sim, confirmo.", cancel: "Não, cancelar."},
            onCancel: ()=>{},
            onConfirm: ()=>{deleteData(id);getTeams()},
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
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordAthletes}`).then((response)=>{
            setRkeywordAthletes(response.data.access);
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
        getTeams();
     },[rkeywordAdd,rkeywordDel,rkeywordEdit,rkeywordView, rkeywordAthletes])

    useEffect(()=>{
        verifyPermissions();
        getModalities();
        getEntities();
    },[])

    return(<>
        <Base>
        <Modal opened={modalAdd} onClose={()=>{modalAddHandlers.close()}} title="Cadastrar equipe">
            <Add close={()=>{modalAddHandlers.close()}} getTeams={()=>{getTeams()}}>

            </Add>
        </Modal>

        <Modal opened={modalEdit} onClose={()=>{modalEditHandlers.close()}} title="Editar modalidade">
            <Edit id={selectedTeam} close={()=>{modalEditHandlers.close()}} getTeams={()=>{getTeams()}}>

            </Edit>
        </Modal>

        <Modal title={"Gerentes da equipe"} opened={modalManagers} onClose={()=>{
            modalManagersHandlers.close()
        }}>
            <Managers id={selectedTeam}>
                
            </Managers>
        </Modal>
        <Modal size="auto" opened={modalAthletes} onClose={()=>{
            modalAthletesHandlers.close();
        }}>
            <View id={selectedTeam}>

            </View>
        </Modal>
            <div className="baseMain">
                <Filters title="Minhas equipes"
                onSubmit={filterForm.onSubmit((e)=>{getTeams(e)})}
                buttons={[<Button type="submit" color="blue" leftSection={<IconFilter></IconFilter>}>Filtrar</Button>,<Button onClick={()=>{modalAddHandlers.open()}} color="green" leftSection={<IconPlus></IconPlus>} disabled={!rkeywordAdd}>Cadastrar</Button>]}>
                    <TextInput label="ID" {...filterForm.getInputProps("id")}></TextInput>
                    <TextInput label="Nome" {...filterForm.getInputProps("name")}></TextInput>
                    <Select data={entities} label={"Entidade"} {...filterForm.getInputProps("entity")}></Select>
                    <Select data={modalities} label={"Modalidade"} {...filterForm.getInputProps("modality")}></Select>
                </Filters>
                <TablePagination data={teamsTable} head={["ID","Nome","Entidade", "Modalidade","Ações"]} numMaxRegsPags={20}></TablePagination>
            </div>
        </Base>
    </>)
}