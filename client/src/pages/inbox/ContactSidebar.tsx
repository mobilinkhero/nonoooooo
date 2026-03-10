import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    User,
    Phone,
    Mail,
    Tag as TagIcon,
    Plus,
    X,
    StickyNote,
    Clock,
    Trash2,
    Database,
    ExternalLink,
    Info
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";

interface ContactSidebarProps {
    contactId: string;
    onClose: () => void;
}

export default function ContactSidebar({ contactId, onClose }: ContactSidebarProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [newTag, setNewTag] = useState("");
    const [newNote, setNewNote] = useState("");
    const [newVarKey, setNewVarKey] = useState("");
    const [newVarValue, setNewVarValue] = useState("");

    // Fetch contact details
    const { data: contact, isLoading: contactLoading } = useQuery({
        queryKey: [`/api/contacts/${contactId}`],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/contacts/${contactId}`);
            return res.json();
        },
        enabled: !!contactId,
    });

    // Fetch contact notes
    const { data: notes = [], isLoading: notesLoading } = useQuery({
        queryKey: [`/api/contacts/${contactId}/notes`],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/contacts/${contactId}/notes`);
            return res.json();
        },
        enabled: !!contactId,
    });

    // Update contact mutation
    const updateContactMutation = useMutation({
        mutationFn: async (updates: any) => {
            const res = await apiRequest("PUT", `/api/contacts/${contactId}`, updates);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/contacts/${contactId}`] });
        },
        onError: (error: Error) => {
            toast({
                title: "Error updating contact",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Create note mutation
    const createNoteMutation = useMutation({
        mutationFn: async (content: string) => {
            const res = await apiRequest("POST", `/api/contacts/${contactId}/notes`, { content });
            return res.json();
        },
        onSuccess: () => {
            setNewNote("");
            queryClient.invalidateQueries({ queryKey: [`/api/contacts/${contactId}/notes`] });
            toast({ title: "Note added" });
        },
    });

    // Delete note mutation
    const deleteNoteMutation = useMutation({
        mutationFn: async (noteId: string) => {
            await apiRequest("DELETE", `/api/contacts/notes/${noteId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/contacts/${contactId}/notes`] });
            toast({ title: "Note deleted" });
        },
    });

    const handleAddTag = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTag.trim()) return;

        const currentTags = Array.isArray(contact?.tags) ? contact.tags : [];
        if (currentTags.includes(newTag.trim())) {
            setNewTag("");
            return;
        }

        updateContactMutation.mutate({
            tags: [...currentTags, newTag.trim()]
        });
        setNewTag("");
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const currentTags = Array.isArray(contact?.tags) ? contact.tags : [];
        updateContactMutation.mutate({
            tags: currentTags.filter((tag: string) => tag !== tagToRemove)
        });
    };

    const handleAddVariable = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newVarKey.trim() || !newVarValue.trim()) return;

        const currentVars = contact?.variables || {};
        updateContactMutation.mutate({
            variables: {
                ...currentVars,
                [newVarKey.trim()]: newVarValue.trim()
            }
        });
        setNewVarKey("");
        setNewVarValue("");
    };

    const handleRemoveVariable = (keyToRemove: string) => {
        const currentVars = { ...contact?.variables };
        delete currentVars[keyToRemove];
        updateContactMutation.mutate({ variables: currentVars });
    };

    const handleCreateNote = () => {
        if (!newNote.trim()) return;
        createNoteMutation.mutate(newNote);
    };

    if (contactLoading) {
        return (
            <div className="w-80 border-l bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!contact) return null;

    return (
        <div className="w-96 border-l bg-white flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    Contact Details
                </h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-gray-500 hover:text-gray-900">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 space-y-8">
                    {/* Profile Header */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                            <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=random`} />
                            <AvatarFallback className="text-2xl bg-primary text-white">
                                {contact.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-gray-900">{contact.name}</h3>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                                {contact.status || "active"}
                            </Badge>
                        </div>
                    </div>

                    <Separator className="bg-gray-100" />

                    {/* Quick Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 group p-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                                <Phone className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</p>
                                <p className="text-sm font-semibold text-gray-900">{contact.phone}</p>
                            </div>
                        </div>
                        {contact.email && (
                            <div className="flex items-center gap-4 group p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                                    <Mail className="h-4 w-4 text-orange-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</p>
                                    <p className="text-sm font-semibold text-gray-900">{contact.email}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-4 group p-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                                <Clock className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Last Contact</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {contact.lastContact ? format(new Date(contact.lastContact), "MMM d, yyyy HH:mm") : "Never"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-gray-100" />

                    {/* Tabs for interactive content */}
                    <Tabs defaultValue="tags" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 p-1">
                            <TabsTrigger value="tags" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Tags</TabsTrigger>
                            <TabsTrigger value="vars" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Variables</TabsTrigger>
                            <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Notes</TabsTrigger>
                        </TabsList>

                        {/* Tags Tab */}
                        <TabsContent value="tags" className="mt-4 space-y-4">
                            <div className="flex flex-wrap gap-2 min-h-[40px]">
                                {Array.isArray(contact.tags) && contact.tags.length > 0 ? (
                                    contact.tags.map((tag: string) => (
                                        <Badge key={tag} className="pl-3 pr-1 py-1 gap-1 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 transition-all flex items-center shadow-sm">
                                            <TagIcon className="h-3 w-3 text-primary/70" />
                                            {tag}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-4 w-4 hover:bg-red-50 hover:text-red-500 rounded-full"
                                                onClick={() => handleRemoveTag(tag)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No tags assigned</p>
                                )}
                            </div>
                            <form onSubmit={handleAddTag} className="flex gap-2">
                                <Input
                                    placeholder="New tag..."
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    className="h-9 border-gray-200 focus:ring-primary/20"
                                />
                                <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </form>
                        </TabsContent>

                        {/* Variables Tab */}
                        <TabsContent value="vars" className="mt-4 space-y-4">
                            <div className="space-y-3">
                                {contact.variables && Object.keys(contact.variables).length > 0 ? (
                                    Object.entries(contact.variables as Record<string, string>).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                                            <div className="flex items-start gap-3">
                                                <Database className="h-4 w-4 text-primary/50 mt-1" />
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">{key}</p>
                                                    <p className="text-sm font-medium text-gray-700">{value}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                onClick={() => handleRemoveVariable(key)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-4 text-center border-2 border-dashed border-gray-100 rounded-xl">
                                        <p className="text-sm text-gray-400">No custom variables</p>
                                    </div>
                                )}
                            </div>
                            <Separator className="my-2 bg-gray-50" />
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    placeholder="Key (e.g. Order ID)"
                                    value={newVarKey}
                                    onChange={(e) => setNewVarKey(e.target.value)}
                                    className="h-9 text-xs border-gray-200"
                                />
                                <Input
                                    placeholder="Value"
                                    value={newVarValue}
                                    onChange={(e) => setNewVarValue(e.target.value)}
                                    className="h-9 text-xs border-gray-200"
                                />
                            </div>
                            <Button
                                onClick={handleAddVariable}
                                className="w-full h-9 bg-primary"
                                disabled={!newVarKey.trim() || !newVarValue.trim() || updateContactMutation.isPending}
                            >
                                Add Variable
                            </Button>
                        </TabsContent>

                        {/* Notes Tab */}
                        <TabsContent value="notes" className="mt-4 space-y-4">
                            <div className="space-y-4 max-h-[400px]">
                                <div className="space-y-2">
                                    <Textarea
                                        placeholder="Add an internal team note..."
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        className="min-h-[100px] text-sm border-gray-200 focus:ring-primary/20 resize-none rounded-xl"
                                    />
                                    <Button
                                        onClick={handleCreateNote}
                                        className="w-full bg-primary hover:bg-primary/90"
                                        disabled={createNoteMutation.isPending || !newNote.trim()}
                                    >
                                        Post Note
                                    </Button>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <StickyNote className="h-3 w-3" />
                                        History
                                    </h4>
                                    {notes.length > 0 ? (
                                        notes.map((note: any) => (
                                            <div key={note.id} className="relative group p-4 bg-yellow-50/50 rounded-2xl border border-yellow-100 hover:shadow-md transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-full bg-yellow-200 flex items-center justify-center text-[10px] font-bold text-yellow-700">
                                                            {note.userName?.substring(0, 1).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-900">{note.userName}</p>
                                                            <p className="text-[10px] text-gray-500 font-medium">
                                                                {format(new Date(note.createdAt), "MMM d, HH:mm")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-full"
                                                        onClick={() => deleteNoteMutation.mutate(note.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                                    {note.content}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                            <p className="text-sm text-gray-400">No internal notes yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </ScrollArea>
        </div>
    );
}
