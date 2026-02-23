"use client";

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useRouter, useSearchParams } from "next/navigation";
import { ThreadResponse } from "@/lib/types/api";
import { Loader2 } from "lucide-react";

export default function NewThreadPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const docId = searchParams.get("docId");

    const createThread = useMutation({
        mutationFn: async (docId: string) => {
            const res = await apiClient.post<ThreadResponse>("/threads", {
                doc_id: docId,
            });
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["threads"] });
            router.push(`/threads/${data.id}`);
        },
        onError: (err: any) => {
            console.error("Failed to create thread", err);
            alert(err.response?.data?.detail?.[0]?.msg || "Failed to create thread");
            router.push("/documents");
        },
    });

    useEffect(() => {
        if (!docId) {
            router.replace("/documents");
            return;
        }
        createThread.mutate(docId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="flex flex-col items-center text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Creating new thread...</p>
            </div>
        </div>
    );
}
