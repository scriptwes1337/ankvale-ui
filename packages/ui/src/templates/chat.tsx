"use client"
import type { TemplateConfiguration } from "@ankvale/ui/templates/shared"
import { useState, useRef, useEffect } from "react"
import { TemplateShell } from "@ankvale/ui/templates/shared"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import { ChatListView } from "@ankvale/ui/components/chat-list-view"
import { ChatConversation } from "@ankvale/ui/components/chat-conversation"
import { ChatMessage } from "@ankvale/ui/components/chat-message"
import { ChatMessageActions } from "@ankvale/ui/components/chat-message-actions"
import { ChatLoader } from "@ankvale/ui/components/chat-loader"
import { Markdown } from "@ankvale/ui/components/markdown"
import {
  PromptInput,
  type PromptSubmission,
} from "@ankvale/ui/components/prompt-input"
import { PromptSuggestion } from "@ankvale/ui/components/prompt-suggestion"
import {
  ModelSelector,
  type ModelOption,
} from "@ankvale/ui/components/model-selector"
import { FileTree } from "@ankvale/ui/components/file-tree"
export type ChatTemplateMessage = {
  id: string
  role: "user" | "assistant"
  text: string
  feedback?: "up" | "down" | null
}
export type ChatTemplateConversation = {
  id: string
  title: string
  messages: ChatTemplateMessage[]
}
export type ChatTemplateProps = {
  initialConversations?: ChatTemplateConversation[]
  models?: ModelOption[]
  onSend?: (
    message: PromptSubmission & {
      model: string
      conversationId: string
      signal: AbortSignal
    }
  ) => Promise<string>
  configuration?: TemplateConfiguration
  className?: string
}
const initial: ChatTemplateConversation[] = [
  {
    id: "welcome",
    title: "Project planning",
    messages: [
      {
        id: "intro",
        role: "assistant",
        text: "What would you like to work on?",
      },
    ],
  },
  {
    id: "brief",
    title: "Website redesign",
    messages: [
      {
        id: "question",
        role: "user",
        text: "What should we review before release?",
      },
      {
        id: "response",
        role: "assistant",
        text: "Review the navigation, keyboard access, mobile layouts, and form validation.",
      },
    ],
  },
]
const defaultModels: ModelOption[] = [
  { id: "example-a", name: "Model A", provider: "Example" },
  { id: "example-b", name: "Model B", provider: "Example" },
]
export function ChatTemplate({
  initialConversations = initial,
  models = defaultModels,
  onSend,
  className,
  configuration,
}: ChatTemplateProps) {
  const [conversations, setConversations] = useState(initialConversations),
    [selected, setSelected] = useState(initialConversations[0]?.id ?? ""),
    [page, setPage] = useState("chat"),
    [query, setQuery] = useState(""),
    [prompt, setPrompt] = useState(""),
    [model, setModel] = useState(models[0]?.id ?? ""),
    [pending, setPending] = useState(false),
    [error, setError] = useState("")
  const request = useRef<AbortController | null>(null)
  useEffect(() => () => request.current?.abort(), [])
  const conversation = conversations.find((item) => item.id === selected)
  function stop() {
    request.current?.abort()
    request.current = null
    setPending(false)
  }
  function open(id: string) {
    stop()
    setSelected(id)
    setPage("chat")
    setError("")
  }
  function create() {
    stop()
    const id = crypto.randomUUID()
    setConversations((items) => [
      { id, title: "New conversation", messages: [] },
      ...items,
    ])
    setSelected(id)
    setPage("chat")
    setError("")
  }
  async function send(message: PromptSubmission) {
    if (request.current) return
    let id = selected
    if (!conversation) {
      id = crypto.randomUUID()
      setConversations((items) => [
        { id, title: message.text.slice(0, 40) || "Attachments", messages: [] },
        ...items,
      ])
      setSelected(id)
    }
    const user: ChatTemplateMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text:
        message.text +
        (message.files.length
          ? `\n\nAttachments: ${message.files.map((file) => file.name).join(", ")}`
          : ""),
    }
    setConversations((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              title: item.messages.length
                ? item.title
                : message.text.slice(0, 40) || "Attachments",
              messages: [...item.messages, user],
            }
          : item
      )
    )
    const controller = new AbortController()
    request.current = controller
    setPending(true)
    setError("")
    let abortListener: (() => void) | undefined
    try {
      const response = onSend
        ? await Promise.race([
            onSend({
              ...message,
              model,
              conversationId: id,
              signal: controller.signal,
            }),
            new Promise<string>((_, reject) => {
              abortListener = () =>
                reject(new DOMException("Request stopped", "AbortError"))
              controller.signal.addEventListener("abort", abortListener, {
                once: true,
              })
            }),
          ])
        : "Your message was added to this local preview. This template does not call an AI service."
      if (!controller.signal.aborted)
        setConversations((items) =>
          items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  messages: [
                    ...item.messages,
                    {
                      id: crypto.randomUUID(),
                      role: "assistant",
                      text: response,
                    },
                  ],
                }
              : item
          )
        )
    } catch (e) {
      if (!controller.signal.aborted) {
        setConversations((items) =>
          items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  messages: item.messages.filter(
                    (message) => message.id !== user.id
                  ),
                }
              : item
          )
        )
        setError(
          e instanceof Error ? e.message : "Could not receive a response."
        )
        throw e
      }
    } finally {
      if (abortListener)
        controller.signal.removeEventListener("abort", abortListener)
      if (request.current === controller) {
        request.current = null
        setPending(false)
      }
    }
  }
  return (
    <TemplateShell
      configuration={configuration}
      brand="Ankvale chat"
      pages={[
        { id: "chat", label: "Conversations" },
        { id: "library", label: "Library" },
        { id: "explore", label: "Explore" },
      ]}
      active={page}
      onNavigate={(id) => {
        stop()
        setPage(id)
      }}
      title={
        page === "chat"
          ? (conversation?.title ?? "New conversation")
          : page === "library"
            ? "Library"
            : "Explore"
      }
      className={className}
      actions={
        <Button size="sm" variant="outline" onClick={create}>
          New chat
        </Button>
      }
      sidebarFooter={
        <div className="min-h-0 space-y-3 px-3">
          <Input
            aria-label="Search conversations"
            placeholder="Search conversations…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ChatListView
            items={conversations.filter((item) =>
              item.title.toLowerCase().includes(query.toLowerCase())
            )}
            value={selected}
            onValueChange={open}
            onDelete={(id) => {
              if (id === selected) {
                stop()
                setSelected("")
              }
              setConversations((items) =>
                items.filter((item) => item.id !== id)
              )
            }}
          />
        </div>
      }
    >
      {page === "library" ? (
        <div className="max-w-xl space-y-5 p-6">
          <h1 className="text-2xl font-semibold">Library</h1>
          <FileTree
            label="Chat documents"
            nodes={[
              {
                id: "projects",
                name: "Projects",
                children: [
                  { id: "brief", name: "Project brief.md" },
                  { id: "notes", name: "Meeting notes.md" },
                ],
              },
              { id: "guide", name: "Design guidelines.md" },
            ]}
            defaultExpanded={["projects"]}
          />
        </div>
      ) : page === "explore" ? (
        <div className="mx-auto max-w-2xl space-y-6 p-6">
          <h1 className="text-2xl font-semibold">Explore</h1>
          <PromptSuggestion
            items={[
              { id: "summary", text: "Summarize the project brief" },
              { id: "tasks", text: "Extract action items" },
              { id: "review", text: "Prepare a design review" },
              { id: "plan", text: "Draft a release checklist" },
            ]}
            onSelect={(text) => {
              setPrompt(text)
              setPage("chat")
            }}
          />
        </div>
      ) : (
        <div className="mx-auto flex h-full min-h-0 max-w-4xl flex-col gap-3 p-4">
          <ChatConversation className="min-h-0 flex-1 border-0">
            {conversation?.messages.length ? (
              conversation.messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  actions={
                    message.role === "assistant" ? (
                      <ChatMessageActions
                        text={message.text}
                        feedback={message.feedback}
                        onFeedback={(feedback) =>
                          setConversations((items) =>
                            items.map((item) =>
                              item.id === selected
                                ? {
                                    ...item,
                                    messages: item.messages.map((value) =>
                                      value.id === message.id
                                        ? { ...value, feedback }
                                        : value
                                    ),
                                  }
                                : item
                            )
                          )
                        }
                      />
                    ) : undefined
                  }
                >
                  <Markdown>{message.text}</Markdown>
                </ChatMessage>
              ))
            ) : (
              <div className="m-auto max-w-lg">
                <PromptSuggestion
                  items={[
                    { id: "summary", text: "Summarize a document" },
                    { id: "plan", text: "Plan a project" },
                  ]}
                  onSelect={setPrompt}
                />
              </div>
            )}
            {pending && <ChatLoader />}
          </ChatConversation>
          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
          <PromptInput
            value={prompt}
            onValueChange={setPrompt}
            onSubmit={send}
            streaming={pending}
            onStop={stop}
            toolbar={
              <ModelSelector
                models={models}
                value={model}
                onValueChange={setModel}
                disabled={pending}
              />
            }
          />
        </div>
      )}
    </TemplateShell>
  )
}
