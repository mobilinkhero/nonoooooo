import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loading } from "@/components/ui/loading";
import { Plus, Trash2, Edit2, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export const CannedResponsesSettings = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingResponse, setEditingResponse] = useState<any>(null);
    const [shortcut, setShortcut] = useState("");
    const [content, setContent] = useState("");
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: activeChannel } = useQuery({
        queryKey: ["/api/channels/active"],
        queryFn: async () => {
            const res = await fetch("/api/channels/active");
            return res.ok ? res.json() : null;
        },
    });

    const { data: responses = [], isLoading } = useQuery({
        queryKey: ["/api/canned-responses", activeChannel?.id],
        queryFn: async () => {
            const res = await fetch(`/api/canned-responses?channelId=${activeChannel?.id}`);
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
        },
        enabled: !!activeChannel?.id,
    });

    const saveMutation = useMutation({
        mutationFn: async () => {
            const url = editingResponse
                ? `/api/canned-responses/${editingResponse.id}`
                : `/api/canned-responses`;
            const method = editingResponse ? "PUT" : "POST";
            const payload = { shortcut, content };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to save response");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/canned-responses"] });
            toast({ title: "Success", description: "Canned response saved" });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/canned-responses/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete response");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/canned-responses"] });
            toast({ title: "Deleted", description: "Canned response removed" });
        },
    });

    const resetForm = () => {
        setEditingResponse(null);
        setShortcut("");
        setContent("");
    };

    const handleEdit = (r: any) => {
        setEditingResponse(r);
        setShortcut(r.shortcut);
        setContent(r.content);
        setIsDialogOpen(true);
    };

    if (!activeChannel) {
        return (
            <Card>
                <CardContent className="p-8 text-center text-gray-500">
                    Please select an active channel to manage quick replies.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Quick Replies (Canned Responses)</CardTitle>
                    <CardDescription>
                        Create shortcuts for messages you send often. Use them in the Inbox using the Zap icon.
                    </CardDescription>
                </div>
                <Dialog
                    open={isDialogOpen}
                    onOpenChange={(v) => {
                        setIsDialogOpen(v);
                        if (!v) resetForm();
                    }}
                >
                    <DialogTrigger asChild>
                        <Button className="bg-amber-500 hover:bg-amber-600">
                            <Plus className="w-4 h-4 mr-2" /> Add Quick Reply
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingResponse ? "Edit Quick Reply" : "New Quick Reply"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Shortcut Text</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono">/</span>
                                    <Input
                                        className="pl-7 font-mono"
                                        placeholder="e.g. pricing"
                                        value={shortcut}
                                        onChange={(e) => setShortcut(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                                    />
                                </div>
                                <p className="text-xs text-gray-500">Only letters, numbers, dashes, and underscores allowed.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Full Message</Label>
                                <Textarea
                                    placeholder="Enter the full message text..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="min-h-[120px]"
                                />
                            </div>
                            <Button
                                className="w-full bg-amber-500 hover:bg-amber-600"
                                onClick={() => saveMutation.mutate()}
                                disabled={!shortcut || !content || saveMutation.isPending}
                            >
                                {saveMutation.isPending ? "Saving..." : "Save Quick Reply"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loading />
                    </div>
                ) : responses.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                        <Zap className="w-12 h-12 text-amber-300 mx-auto mb-3" />
                        <h3 className="font-medium text-gray-900 mb-1">No quick replies yet</h3>
                        <p className="text-sm text-gray-500">
                            Save time by creating shortcuts for your most common answers.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {responses.map((r: any) => (
                            <div key={r.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-amber-100 text-amber-800 text-xs font-mono px-2 py-1 rounded-md font-semibold">
                                            /{r.shortcut}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-4">{r.content}</p>
                                </div>
                                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(r)}>
                                        <Edit2 className="w-4 h-4 mr-1 text-gray-500" /> Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => {
                                            if (confirm(`Delete the /${r.shortcut} quick reply?`)) {
                                                deleteMutation.mutate(r.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
