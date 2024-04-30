'use client'

import { useEffect, useState } from "react";
import api from "@/services/api";
import configUrl from "@/services/configUrl";
import { Text, List, Fieldset, Image, Anchor } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";

export default function View(props){

    const [entityInfos, setEntityInfos] = useState({});
    const [map, setMap] = useState(null);
    const [shield, setShield] = useState(null);

    useEffect(()=>{
        if(props.id != null){
            api.get(`/entities/select?id=${props.id}`).then((response)=>{
                console.log(response)
                setEntityInfos(response.data[0]);

                fetch(`https://maps.googleapis.com/maps/api/staticmap?center=${response.data[0].geolocation}&zoom=17&size=400x400&markers=${response.data[0].geolocation}&key=AIzaSyAja-y8xoOUm11dpr7Z2yXDaYM2-XTPZDs`,{method: "GET", mode: "cors", cache: "default"}).then((response)=>{
                    setMap(response.url);
                }).catch((error)=>{
                    notifications.show({
                        title: "Erro!",
                        message: "Não foi possível gerar o mapa do endereço.",
                        color: "red"
                    })
                })

            }).catch((error)=>{
                notifications.show({
                    title: "Erro!",
                    message: error.response.data.message,
                    color: "red"
                })
            })
            api.get(`/entities/shield-image/${props.id}`).then((response)=>{
                setShield(response.data.image);
            }).catch((error)=>{
                notifications.show(
                    {
                        title: "Erro!",
                        message: "Não foi possível selecionar o escudo da entidade.",
                        color: "red"
                    }
                )
            })
        }

        
    },[])
    return(<>
        <List>
            {(shield != null)?(<Fieldset legend="Escudo">
                <Image w="400px" h="400" src={'http://'+configUrl.ip+':'+configUrl.port+"/entity-shields/"+ shield}>
                </Image>
            </Fieldset>):(null)}
            <Fieldset legend="Identificação">
                <List.Item><Text><Text span fw={700}>Nome oficial:</Text> {entityInfos.name_official}</Text></List.Item>
                <List.Item><Text><Text span fw={700}>Nome popular:</Text> {entityInfos.name_popular}</Text></List.Item>
                <List.Item><Text><Text span fw={700}>Categoria:</Text> {entityInfos.category_name}</Text></List.Item>
                <List.Item><Text><Text span fw={700}>Abreviação:</Text> {entityInfos.abbreviation}</Text></List.Item>
                <List.Item><Text><Text span fw={700}>CNPJ:</Text> {entityInfos.cnpj}</Text></List.Item>
                <List.Item><Text><Text span fw={700}>INEP Code:</Text> {(entityInfos.inep_code != "" ? entityInfos.inep_code : 'Não informado')}</Text></List.Item>
                <List.Item><Text><Text span fw={700}>Natureza:</Text> {(entityInfos.nature == "public" ? ("Pública") : ("Privada"))}</Text></List.Item>
            </Fieldset>
            <Fieldset legend="História">
                <List.Item><Text><Text span fw={700}>Data de fundação:</Text> {entityInfos.date_foundation != "" && entityInfos.date_foundation != null ? (dayjs(entityInfos.date_foundation).format("DD/MM/YYYY")):"Não informado"}</Text></List.Item>
                <List.Item><Text><Text span fw={700}>História:</Text> {(entityInfos.history != "" ? entityInfos.history : "Não informado")}</Text></List.Item>
            </Fieldset>
            <Fieldset legend="Contato">
                <List.Item><Text><Text span fw={700}>Site:</Text> {entityInfos.site != ""? (<Anchor href={entityInfos.site} target="_blank">{entityInfos.site}</Anchor>) : 'Não informado'}</Text></List.Item>
                <List.Item><Text><Text span fw={700}>E-mail:</Text> {entityInfos.email}</Text></List.Item>
            </Fieldset>
            <Fieldset legend="Endereço">
                <Image src={map} mb={"1vh"}></Image>
                <List.Item><Text><Text span fw={700}>Geolocalização:</Text> {entityInfos.geolocation}</Text></List.Item>
                <List.Item><Text><Text span fw={700}>País:</Text> {entityInfos.country}</Text></List.Item>
                <List.Item><Text><Text span fw={700}>Endereço:</Text> {entityInfos.address}</Text></List.Item>
                <List.Item><Text><Text span fw={700}>Número:</Text> {entityInfos.address_number}</Text></List.Item>
                <List.Item><Text><Text span fw={700}>Complemento:</Text> {(entityInfos.address_complement != "" ? (entityInfos.address_complement) : ("Não informado"))}</Text></List.Item>
                <List.Item><Text><Text span fw={700}>CEP:</Text> {entityInfos.cep}</Text></List.Item>
                <List.Item><Text><Text span fw={700}>Cidade:</Text> {entityInfos.city}</Text></List.Item>
                <List.Item><Text><Text span fw={700}>Estado:</Text> {entityInfos.state}</Text></List.Item>
            </Fieldset>
            
            
            
        </List>
    </>)
}