'use client'
import api from "@/services/api";
import configUrl from "@/services/configUrl";
import { Flex, Image, Group, Text, Badge } from "@mantine/core";
import dayjs from "dayjs";
import { useEffect, useState } from "react";


export default function IdCard(){

    const [profileImage, setProfileImage] = useState("/img/blank-profile-picture.jpg");
    const [userInfos, setUserInfos] = useState(null);
    const [userAccessGroups, setUserAccessGroups] = useState(null);

    const getProfileImage = ()=>{
        api.get(`/users/profile-image/${sessionStorage.getItem("id")}`).then((response)=>{
            if(response.data.path != undefined){
                setProfileImage("http://" + configUrl.ip+ ":" +configUrl.port+ "/user-images/" + response.data.path);
            }
        }).catch((error)=>{
            setProfileImage("/img/blank-profile-picture.jpg");
        })
    }

    const getUserInfos = ()=>{

        api.get(`/users/${sessionStorage.getItem("id")}`).then((response)=>{
            let aux = response.data;

            if(aux.gender == "male"){
                aux.gender = "Masculino";
            }
            if(aux.gender == "female"){
                aux.gender = "Feminino";
            }
            if(aux.pcd == "yes"){
                aux.pcd = <Badge>Sim</Badge>
            }
            if(aux.pcd == "no"){
                aux.pcd = <Badge color="grey">Não</Badge>
            }

            aux.date_birth = dayjs(aux.date_birth).format("DD/MM/YYYY");

            setUserInfos(response.data);
        }).catch((error)=>{

        })

        api.get(`/users/access-group/${sessionStorage.getItem("id")}`).then((response)=>{
            let access_groups = [];
            let counter = 0;
            response.data.access_groups.forEach((group)=>{
                api.get(`/access-group/select/${group}`).then((response1)=>{
                    counter++;
                    access_groups.push(<Badge color="green">{response1.data.name}</Badge>);
                    if(counter == response.data.access_groups.length){
                        setUserAccessGroups(access_groups);
                    }
                })         
            })
            
        }).catch((error)=>{

        })
    }

    useEffect(()=>{
        getProfileImage();
        getUserInfos();
    },[])

    return(<>
        <Flex direction={"row"} gap={"1vh"}>
            <Group>
                <Flex justify={"center"} bg={"grey"}>
                <Image fit="fill" w={200} h={200} src={profileImage}></Image>
                </Flex>
            </Group>
            <Group>
                <Flex h={"100%"} direction={"column"} align={"center"}>
                    <Flex h={"100%"} direction={"column"} justify={"flex-start"} align={"flex-start"} >
                        <Text><Text span fw={700}>Nome:</Text> {(userInfos != null) ? (userInfos.name):(null)}</Text>
                        <Text><Text span fw={700}>Data de nacimento:</Text> {(userInfos != null) ? (userInfos.date_birth):(null)}</Text>
                        <Text><Text span fw={700}>Gênero:</Text> {(userInfos != null) ? (userInfos.gender):(null)}</Text>
                        <Text><Text span fw={700}>Pessoa com deficiência (PCD):</Text> {(userInfos != null) ? (userInfos.pcd):(null)}</Text>
                        <Text><Text span fw={700}>Grupo de acesso:</Text> {(userInfos != null) ? (userAccessGroups):(null)}</Text>
                        <Text><Text span fw={700}>Identificação:</Text> {(userInfos != null) ? (sessionStorage.getItem("id")):(null)}</Text>
                    </Flex>
                <h2>Podium 🏆</h2>
                </Flex>
            </Group>
        </Flex>
    </>)
}