/**
 * ============================================================
 * © 2025 Diploy — a brand of Bisht Technologies Private Limited
 * Original Author: BTPL Engineering Team
 * Website: https://diploy.in
 * Contact: cs@diploy.in
 *
 * Distributed under the Envato / CodeCanyon License Agreement.
 * Licensed to the purchaser for use as defined by the
 * Envato Market (CodeCanyon) Regular or Extended License.
 *
 * You are NOT permitted to redistribute, resell, sublicense,
 * or share this source code, in whole or in part.
 * Respect the author's rights and Envato licensing terms.
 * ============================================================
 */

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TestTube, RefreshCw } from "lucide-react";

interface TestMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string | null;
}

export function TestMessageDialog({ open, onOpenChange, channelId }: TestMessageDialogProps) {
  const [testPhoneNumber, setTestPhoneNumber] = useState("");
  const [testMessage, setTestMessage] = useState("Hello! This is a test message from Chatvoo.");
  const { toast } = useToast();

  // Test message mutation
  const testMessageMutation = useMutation({
    mutationFn: async () => {
      if (!channelId) throw new Error("No channel selected");

      // Format phone number for WhatsApp API
      let formattedPhone = testPhoneNumber.replace(/\D/g, '');
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }

      return await apiRequest("POST", `/api/whatsapp/channels/${channelId}/test`, {
        phoneNumber: formattedPhone,
        message: testMessage,
      });
    },
    onSuccess: () => {
      toast({
        title: "Test Message Sent",
        description: "The test message has been sent successfully to " + testPhoneNumber,
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to send test message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendTest = () => {
    if (!testPhoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a recipient phone number.",
        variant: "destructive",
      });
      return;
    }
    if (!testMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message to send.",
        variant: "destructive",
      });
      return;
    }
    testMessageMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden border-none p-0 bg-white text-slate-900 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-emerald-500/[0.03] pointer-events-none" />

        <DialogHeader className="p-6 pb-2 relative">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-100 group shadow-sm">
              <TestTube className="w-5 h-5 text-indigo-600 group-hover:rotate-12 transition-transform" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">
                Send Test Message
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-xs mt-1">
                Verify your WhatsApp channel configuration instantly
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5 relative">
          <div className="space-y-2">
            <Label htmlFor="testPhone" className="text-sm font-semibold text-slate-700 ml-1">
              Recipient Phone Number
            </Label>
            <div className="relative group">
              <Input
                id="testPhone"
                placeholder="e.g. 919876543210"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
                className="bg-white border-slate-200 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all h-11 text-base shadow-sm placeholder:text-slate-400"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 ml-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
              Enter with country code (e.g. 91 for India) without + or spaces.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="testMessage" className="text-sm font-semibold text-slate-700 ml-1">
              Test Content
            </Label>
            <Textarea
              id="testMessage"
              placeholder="Enter your test message..."
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="bg-white border-slate-200 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all min-h-[100px] resize-none shadow-sm placeholder:text-slate-400"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="p-6 pt-3 bg-slate-50/80 border-t border-slate-100 relative flex gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 h-11 font-medium transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendTest}
            disabled={testMessageMutation.isPending}
            className="flex-[2] h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-600/20"
          >
            {testMessageMutation.isPending ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-white/90" />
                Sending...
              </span>
            ) : (
              "Send Test Message"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}