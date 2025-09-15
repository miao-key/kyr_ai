"use client";
import type {
    Message
} from "ai";
import ReactMarkdown from "react-markdown";

interface ChatOutputProps {
    messages: Message[];
    status: string
}

export default function ChatOutput({
    messages,
    status
}: ChatOutputProps) {
    return (
        <>
            {
                messages.map((message,index) => (
                    message.role === 'user' ? (
                        <UserChat key={index} content={message.content}/>
                    ) : (
                        <AssistantChat key={index} content={message.content}/>
                    )
                )
              )
            }
            {
                status === "submitted" && (
                    <div className="text-muted-foreground">
                        Generating response...
                    </div>
                )
            }
            {
                status === "error" && (
                    <div className="text-red-500">An error occurred.</div>
                )
            }
        </>
    )
}

const UserChat = ({content}: {content: string}) => {
    return (
        <div className="bg-blue-600 text-white rounded-2xl ml-auto max-w-[80%] w-fit px-4 py-3 mb-6 shadow-sm">
            <p className="leading-relaxed">{content}</p>
        </div>
    )
}

const AssistantChat = ({content}: {content: string}) => {
    return (
        <div className="flex justify-start mb-6">
            <div className="flex items-start space-x-3 max-w-[85%]">
                {/* AI头像 */}
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    AI
                </div>
                {/* AI消息气泡 */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700 markdown-content">
                    <ReactMarkdown
                      components={{
                a: ({href, children}) => (
                    <a target="_blank" href={href} className="text-blue-600 hover:text-blue-800 underline">{children}</a>
                ),
                h1: ({children}) => (
                    <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600 pb-2">{children}</h1>
                ),
                h2: ({children}) => (
                    <h2 className="text-xl font-semibold mb-3 text-blue-700 dark:text-blue-400 flex items-center">
                        <span className="mr-2">🎬</span>{children}
                    </h2>
                ),
                h3: ({children}) => (
                    <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg border-l-4 border-blue-500">{children}</h3>
                ),
                p: ({children}) => (
                    <p className="mb-4 leading-7 text-gray-700 dark:text-gray-300">{children}</p>
                ),
                ol: ({children}) => (
                    <ol className="list-decimal list-inside mb-4 space-y-2 pl-4">{children}</ol>
                ),
                ul: ({children}) => (
                    <ul className="list-disc list-inside mb-4 space-y-2 pl-4">{children}</ul>
                ),
                li: ({children}) => (
                    <li className="leading-6 text-gray-700 dark:text-gray-300 mb-1">{children}</li>
                ),
                strong: ({children}) => (
                    <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>
                ),
                em: ({children}) => (
                    <em className="italic text-gray-600 dark:text-gray-400">{children}</em>
                ),
                blockquote: ({children}) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-900/20 mb-4 rounded-r">
                        {children}
                    </blockquote>
                ),
                code: ({children, className}) => {
                    const isInline = !className;
                    return isInline ? (
                        <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
                            {children}
                        </code>
                    ) : (
                        <code className={className}>{children}</code>
                    );
                },
                pre: ({children}) => (
                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4">
                        {children}
                    </pre>
                ),
                hr: () => (
                    <hr className="my-6 border-t-2 border-gradient-to-r from-blue-500 to-purple-500 opacity-30" />
                ),
                // 自定义样式用于电影信息
                div: ({ children, className }) => (
                    <div className={`${className || ''} mb-4`}>{children}</div>
                )
              }}
            >{content}</ReactMarkdown>
                </div>
            </div>
        </div>
    )
}
