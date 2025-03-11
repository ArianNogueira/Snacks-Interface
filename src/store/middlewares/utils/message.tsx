import { createStandaloneToast } from "@chakra-ui/toast";

const { toast } = createStandaloneToast();

export function message(message: string, status: "success" | "error") {
    toast({
        title: status === "success" ? "Sucesso" : "Erro",
        description: message,
        status: status,
        duration: 2000,
        isClosable: true,
    });
    return;
}
