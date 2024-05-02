'use client'
import { TextInput, Select, Radio, Button, Flex, Group, Fieldset, NumberInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconPlus } from "@tabler/icons-react";
import api from "@/services/api";

export default function Add(){

    const form = useForm({
        initialValues:{
            user: sessionStorage.getItem("id"),
            name: "",
            surname: "",
            date_start: new Date(),
            date_end: new Date(),
            gender: "free",
            max_athletes_teams: 1,
            max_leaders_teams_select: "no",
            max_leaders_teams: null,
            max_min_age_select: "no",
            max_age_athletes: null,
            min_age_athletes: null,
            indexed_summary: "0",
            registrations: "adm",
            registrations_date_start: new Date(),
            registrations_date_end: new Date(),
            max_vacancies_select: "no",
            max_vacancies: null,
            reregistration_athletes: "0",
            image_profile: "0",
            trophy: "0",
            medals: "0",
            min_rating_medals: null,
            medals_leaders: "0",

        }, validate:{
            name: (value)=>(value.length > 0 ? null : 'Preencha esse campo'),
            surname: (value)=>(value.length > 0 ? null : 'Preencha esse campo'),
            max_athletes_teams: (value)=>(value == null || value <= 0 ? 'Preencha corretamente esse campo.' : null),
            max_leaders_teams: (value, values)=>(values.max_leaders_teams_select == "yes" && (value == "" || value == null) ? 'Preencha esse campo corretamente' : null ),
            max_age_athletes: (value, values)=>(values.max_min_age_select == "yes" && (value == "" || value == null) ? 'Preencha esse campo corretamente' : null ),
            min_age_athletes: (value, values)=>(values.max_min_age_select == "yes" && (value == "" || value == null) ? 'Preencha esse campo corretamente' : null ),
            max_vacancies: (value, values)=>(values.max_vacancies_select == "yes" && (value == "" || value == null) ? 'Preencha esse campo corretamente' : null ),
        }
    });

    const sendData = (value)=>{

    }

    return(<>
    <form onSubmit={form.onSubmit((e)=>{console.log(e)})}>
    
    <Fieldset legend="Identificação">
        <Flex direction={"column"} gap={"1vh"}>
        
            <TextInput radius="xl" label="Nome oficial" placeholder="Nome oficial" {...form.getInputProps("name")}></TextInput>
            <TextInput radius="xl" label="Nome popular" placeholder="Nome popular" {...form.getInputProps("surname")}></TextInput>
        
        </Flex>
    </Fieldset>
    <Fieldset legend="Período de realização">
        <Group w={"100%"}>
            <Flex direction={"row"} gap={"1vh"} w={"100%"}>
                <DatePickerInput radius="xl" label="Data de início" w={"100%"} placeholder="Data de início" {...form.getInputProps("date_start")}></DatePickerInput>
                <DatePickerInput radius="xl" label="Data de término" w={"100%"} placeholder="Data de término" {...form.getInputProps("date_end")}></DatePickerInput>
            </Flex>
        </Group>
    </Fieldset>
    <Fieldset legend="Regras">
        <Flex direction={"column"} gap={"1vh"}>
            <Select allowDeselect={false} label="Gênero dos atletas" placeholder="Gênero dos atletas" radius="xl" data={[{value: "male", label: "Masculino"}, {value: "female", label: "Feminino"},{value: "free", label: "Livre"}]} {...form.getInputProps("gender")}></Select>

            <Select allowDeselect={false} label="Limitar número de dirigentes de cada equipe?" placeholder="Limitar número de dirigentes de cada equipe?" radius="xl" data={[{value: "yes", label: "Sim"},{value: "no", label: "Não"}]}{...form.getInputProps("max_leaders_teams_select")}></Select>
            {form.values.max_leaders_teams_select == "yes" ? (
                <NumberInput radius="xl" label="Número máximo de dirigentes" placeholder="Número máximo de dirigentes" {...form.getInputProps("max_leaders_teams")}></NumberInput>
            ) : (null)}

            <NumberInput radius="xl" label="Número máximo de atletas que podem ser inscritos em cada equipe" {...form.getInputProps("max_athletes_teams")}></NumberInput>

            <Select allowDeselect={false} label="Limitar idade dos atletas de cada equipe?" placeholder="Limitar idade dos atletas de cada equipe?" radius="xl" data={[{value: "yes", label: "Sim"},{value: "no", label: "Não"}]}{...form.getInputProps("max_min_age_select")}></Select>
            {form.values.max_min_age_select == "yes" ? (<>
                    <NumberInput radius="xl" label="Idade mínima" placeholder="Idade mínima" {...form.getInputProps("min_age_athletes")}></NumberInput>
                    <NumberInput radius="xl" label="Idade máxima" placeholder="Idade máxima" {...form.getInputProps("max_age_athletes")}></NumberInput>
                </>
            ) : (null)}

            <Select allowDeselect={false} radius="xl" label="Exigir súmula de cada partida antes da inserção do resultado final?" placeholder="Exigir súmula de cada partida antes da inserção do resultado final?" data={[{value: "1", label: "Sim"},{value: "0", label: "Não"}]} {...form.getInputProps("indexed_summary")}>

            </Select>

            <Select allowDeselect={false} radius="xl" label="Grupo responsável pela inscrição de equipes" placeholder="Grupo responsável pela inscrição de equipes" data={[{value: "adm", label: "Somente usuários administradores"},{value: "entity", label: "Gerentes de entidades e usuários administradores"},{value: "team", label: "Gerentes de entidades, gerentes de equipes e usuários administradores"}]} {...form.getInputProps("registrations")}></Select>

            <Select allowDeselect={false} label="Limitar número de equipes que poderão ser inscritas na competição?" placeholder="Limitar número de equipes que poderão ser inscritas na competição?" radius="xl" data={[{value: "yes", label: "Sim"},{value: "no", label: "Não"}]}{...form.getInputProps("max_vacancies_select")}></Select>
            {form.values.max_vacancies_select == "yes" ? (<>
                    <NumberInput radius="xl" label="Número de vagas" placeholder="Número mínimo de vagas" {...form.getInputProps("max_vacancies")}></NumberInput>
                </>
            ) : (null)}

            <Select allowDeselect={false} radius="xl" label="Permitir a dupla inscrição de um atleta?" placeholder="Permitir a dupla inscrição de um atleta?" data={[{value: "1", label: "Sim"},{value: "0", label: "Não"}]} {...form.getInputProps("reregistration_athletes")}></Select>

            <Select allowDeselect={false} radius="xl" label="Para realizar a incrição de um atleta sua foto de perfil precisa estar com o status 'aprovado'?" placeholder="Para realizar a incrição de um atleta sua foto de perfil precisa estar com o status 'aprovado'?" data={[{value: "1", label: "Sim"},{value: "0", label: "Não"}]} {...form.getInputProps("image_profile")}></Select>

            <Select allowDeselect={false} radius="xl" label="Irá ter entrega de troféus?" placeholder="Irá ter entrega de troféu?" data={[{value: "1", label: "Sim"},{value: "0", label: "Não"}]} {...form.getInputProps("trophy")}></Select>

            <Select allowDeselect={false} label="Irá ter entrega de medalhas?" placeholder="Irá ter entrega de medalhas?" radius="xl" data={[{value: "1", label: "Sim"},{value: "0", label: "Não"}]}{...form.getInputProps("medals")}></Select>
            {form.values.medals == "1" ? (<>
                    <NumberInput radius="xl" label="Classificação mínima para recebimento de medalha" placeholder="Classificação mínima para recebimento de medalha" {...form.getInputProps("min_rating_medals")}></NumberInput>
                </>
            ) : (null)}

            <Select allowDeselect={false} label="Irá ter entrega de medalhas para os gerentes de cada equipe?" placeholder="Irá ter entrega de medalhas para os gerentes de cada equipe?" radius="xl" data={[{value: "1", label: "Sim"},{value: "0", label: "Não"}]}{...form.getInputProps("medals_leaders")}></Select>
        </Flex>
    </Fieldset>
    <Fieldset legend="Período de inscrições">
        <Group w={"100%"}>
            <Flex direction={"row"} gap={"1vh"} w={"100%"}>
                <DatePickerInput radius="xl" label="Data de início" w={"100%"} placeholder="Data de início" {...form.getInputProps("registrations_date_start")}></DatePickerInput>
                <DatePickerInput radius="xl" label="Data de término" w={"100%"} placeholder="Data de término" {...form.getInputProps("registrations_date_end")}></DatePickerInput>
            </Flex>
        </Group>
    </Fieldset>
    <Button type="submit" color="green" leftSection={<IconPlus></IconPlus>}>Cadastrar</Button>
    </form>
    </>)
}