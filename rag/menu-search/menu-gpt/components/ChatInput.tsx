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
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <div className="flex-1">
        <Input
          onChange={handleInputChange}
          value={input}
          placeholder="请输入您想了解的菜谱信息..."
          className="w-full px-4 py-3 text-base border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
         />
      </div>
       <Button 
         type="submit" 
         disabled={!input.trim()}
         className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
       >
         <ArrowUp className="w-5 h-5" />
       </Button>
    </form>
  )
}