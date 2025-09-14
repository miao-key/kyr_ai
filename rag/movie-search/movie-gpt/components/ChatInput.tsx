"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    ArrowUp
} from "lucide-react";

interface ChatInputProps {
  input: string;
  handleInputChange: (e:any)=>void;
  handleSubmit: (e: any)=>void;
}
// const ChatInput: React.FC<ChatInputProps> = ({
export default function ChatInput({
  input,
  handleInputChange,
  handleSubmit
}:ChatInputProps) {
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        onChange={handleInputChange}
        value={input}
        placeholder="Ask me something about phones..."
       />
       <Button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
         <ArrowUp />
       </Button>
    </form>
  )
}