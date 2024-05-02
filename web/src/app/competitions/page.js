'use client'
import Base from "@/components/Base/Base";
import Filters from "@/components/Filters/Filters"
import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import Add from "./add/Add";

export default function Competitions(){
    
    const [modalAdd, modalAddHandlers] = useDisclosure(false, {onClose: ()=>{

    }, onOpen: ()=>{

    }})

    return(<>
    <Base>
        <div className="baseMain">
            <Filters
                title="Competições"
                buttons={[<Button onClick={()=>{
                    modalAddHandlers.open();
                }} color="green" leftSection={<IconPlus></IconPlus>}>Cadastrar</Button>]}
                >

            </Filters>
        </div>
       <Modal title={"Cadastrar competição"} opened={modalAdd} onClose={()=>{modalAddHandlers.close()}}>
            <Add>

            </Add>
       </Modal>
    </Base>
    </>)
}