'use client'
import Filters from "@/components/Filters/Filters";
import api from "@/services/api.js";
import { Badge, Button, Modal, Menu, Text, Flex } from "@mantine/core";
import { IconEdit, IconEye, IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import TablePagination from "@/components/TablePagination/TablePagination";
import { useDisclosure } from "@mantine/hooks";
import Crud from "../crud/Crud.js";
import { useEffect, useState } from "react";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import IdCard from "@/components/IdCard/IdCard.js";

export default function View(props){

    const [modalAthletes, modalAthletesHandlers] = useDisclosure(false, {onClose: ()=>{}, onOpen: ()=>{}});
    const [athletes, setAtheletes] = useState([]);
    const [idCard, idCardHandlers] = useDisclosure(false, {onClose: ()=>{}, onOpen: ()=>{}});
    const [selectedAthlete, setSelectedAthlete] = useState(null);

    const getAthletes = ()=>{

        api.get(`/teams/athletes/${props.id}`).then((response)=>{
            let aux = [];
            if(response.data.length > 0){
                response.data.forEach((athlete)=>{
                    let status = null;
                    if(athlete.status == "active"){
                        status = <Badge color="green">Ativo</Badge>
                    }else{
                        status = <Badge color="yellow">Desativado</Badge>
                    }
                    let actions = <Flex gap="1vh"><Button disabled={true} onClick={()=>{
                        setSelectedAthlete(athlete.users_id);
                        idCardHandlers.open();
                    }} leftSection={<IconEye></IconEye>}>Carteira de Ident.</Button></Flex>;

                    aux.push({
                        id: athlete.id,
                        user: athlete.name,
                        status: status,
                        actions: actions
                    })
    
                    setAtheletes(aux);
                })
            }else{
                setAtheletes([{message: "Essa equipe não possui nenhum atleta cadastrado."}]);
            }
            
        }).catch((error)=>{
            console.log(error)
            notifications.show({
                title: "Erro!",
                message: "Não foi possível selecionar os atletas dessa equipe.",
                color: "red"
            })
        })
    }

    useEffect(()=>{
        getAthletes();
    },[])

    const changeStatus = (athlete, status)=>{
        let values = {
            athlete: athlete,
            status: status
        }

        if(status == "active" || status == "disabled"){
            api.put("/teams/athletes/status", values).then((response)=>{
                notifications.show({
                    title: "Sucesso!",
                    message: response.data.message,
                    color: "green"
                })
            }).catch((error)=>{
                notifications.show({
                    title: "Erro!",
                    message: error.response.data.message,
                    color: "color"
                })
            })
        }

    }

    const openModalChangeStatusActive = (id) =>{
        modals.openConfirmModal({
                title: "Ativar atleta",
                centered: true,
                children: (<Text>Você realmente deseja ativar esse atleta? Um atleta ativado tem a possibilidade de participar de competições.</Text>),
                labels: {confirm: "Sim, ativar.", cancel: "Não, manter status atual."},
                confirmProps: {color: "green"},
                onCancel: ()=>{},
                onConfirm: ()=>{
                    changeStatus(id, 'active');
                    getAthletes();
                }
        })
    }

    const openModalChangeStatusDisabled = (id) =>{
        modals.openConfirmModal({
                title: "Ativar atleta",
                centered: true,
                children: (<Text>Você realmente deseja desativar esse atleta? Um atleta desativado não tem a possibilidade de participar de competições.</Text>),
                labels: {confirm: "Sim, desativar.", cancel: "Não, manter status atual."},
                confirmProps: {color: "yellow"},
                onCancel: ()=>{},
                onConfirm: ()=>{
                    changeStatus(id, 'disabled');
                    getAthletes();
                }
        })
    }


    return(<>
    <Modal title={"Gerenciar Atletas"} opened={modalAthletes} onClose={()=>{modalAthletesHandlers.close()}}>
        <Crud id={props.id} getAthletes={()=>{getAthletes()}}></Crud>
    </Modal>
    <Modal size="auto" title="Carteira de identificação" opened={idCard} onClose={()=>{idCardHandlers.close()}}>
        <IdCard id={selectedAthlete}>

        </IdCard>
    </Modal>
        <Filters
            title="Atletas da equipe"
        >
            <TablePagination data={athletes} head={["ID", "Atleta", "Status", "Ações"]}>

</TablePagination>
        </Filters>
        
    </>)
}