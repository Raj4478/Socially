"use client";

import { Loader2Icon, Trash2Icon } from "lucide-react";
import { motion } from "framer-motion";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  isDeleting: boolean;
  onDelete: () => Promise<void>;
  title?: string;
  description?: string;
}

export function DeleteAlertDialog({
  isDeleting, onDelete,
  title = "Delete Post",
  description = "This action cannot be undone.",
}: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-1.5 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
        >
          {isDeleting
            ? <Loader2Icon className="size-3.5 animate-spin" />
            : <Trash2Icon className="size-3.5" />}
        </motion.button>
      </AlertDialogTrigger>
      <AlertDialogContent className="glass rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={isDeleting}
            className="rounded-full bg-red-500 hover:bg-red-600"
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
