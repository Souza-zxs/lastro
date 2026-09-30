"use client";

import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { excluirRegistro } from "@/lib/actions/registros";

export function ExcluirRegistroButton({ registroId, titulo }: { registroId: string; titulo: string }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2 text-destructive hover:bg-destructive/10")}
          />
        }
      >
        <Trash2 className="size-4" />
        Excluir registro
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir &quot;{titulo}&quot;?</DialogTitle>
          <DialogDescription>
            Essa ação não pode ser desfeita. O certificado e o link de verificação deixam de
            funcionar, e o crédito usado neste registro não é devolvido.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <form action={excluirRegistro.bind(null, registroId)} className="w-full sm:w-auto">
            <Button type="submit" variant="destructive" className="w-full">
              Excluir definitivamente
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
