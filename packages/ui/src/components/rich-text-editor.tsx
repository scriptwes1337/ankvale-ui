"use client"
import { useEffect, useState, useId } from "react"
import { useEditor, useEditorState, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import {
  TextBIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  TextStrikethroughIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  QuotesIcon,
  CodeBlockIcon,
  ArrowCounterClockwiseIcon,
  ArrowClockwiseIcon,
  LinkIcon,
} from "@phosphor-icons/react"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@ankvale/ui/components/popover"
import { cn } from "@ankvale/ui/lib/utils"
export type RichTextEditorProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (html: string) => void
  disabled?: boolean
  label?: string
  placeholder?: string
  name?: string
  className?: string
  minHeight?: number
}
export function RichTextEditor({
  value,
  defaultValue = "",
  onValueChange,
  disabled = false,
  label = "Document",
  placeholder = "Write a document…",
  name,
  className,
  minHeight = 180,
}: RichTextEditorProps) {
  const linkId = useId()
  const [link, setLink] = useState("")
  const [linkOpen, setLinkOpen] = useState(false)
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value ?? defaultValue,
    editable: !disabled,
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-label": label,
        "aria-multiline": "true",
        class:
          "outline-none p-4 text-sm leading-7 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:ps-6 [&_ol]:list-decimal [&_ol]:ps-6 [&_blockquote]:border-s-2 [&_blockquote]:ps-4 [&_pre]:rounded [&_pre]:border [&_pre]:p-3 [&_a]:text-primary [&_a]:underline [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child]:before:text-muted-foreground [&_p.is-editor-empty:first-child]:before:float-start [&_p.is-editor-empty:first-child]:before:pointer-events-none",
      },
    },
    onUpdate: ({ editor }) => onValueChange?.(editor.getHTML()),
  })
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive("bold"),
      italic: editor?.isActive("italic"),
      underline: editor?.isActive("underline"),
      strike: editor?.isActive("strike"),
      bullet: editor?.isActive("bulletList"),
      ordered: editor?.isActive("orderedList"),
      quote: editor?.isActive("blockquote"),
      code: editor?.isActive("codeBlock"),
      heading: editor?.isActive("heading", { level: 1 })
        ? "1"
        : editor?.isActive("heading", { level: 2 })
          ? "2"
          : editor?.isActive("heading", { level: 3 })
            ? "3"
            : "0",
      html: editor?.getHTML() ?? "",
    }),
  })
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML())
      editor.commands.setContent(value, { emitUpdate: false })
  }, [editor, value])
  useEffect(() => {
    editor?.setEditable(!disabled)
  }, [editor, disabled])
  const tools = [
    {
      label: "Bold",
      icon: TextBIcon,
      active: state?.bold,
      run: () => editor?.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: TextItalicIcon,
      active: state?.italic,
      run: () => editor?.chain().focus().toggleItalic().run(),
    },
    {
      label: "Underline",
      icon: TextUnderlineIcon,
      active: state?.underline,
      run: () => editor?.chain().focus().toggleUnderline().run(),
    },
    {
      label: "Strikethrough",
      icon: TextStrikethroughIcon,
      active: state?.strike,
      run: () => editor?.chain().focus().toggleStrike().run(),
    },
    {
      label: "Bullet list",
      icon: ListBulletsIcon,
      active: state?.bullet,
      run: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      icon: ListNumbersIcon,
      active: state?.ordered,
      run: () => editor?.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Quote",
      icon: QuotesIcon,
      active: state?.quote,
      run: () => editor?.chain().focus().toggleBlockquote().run(),
    },
    {
      label: "Code block",
      icon: CodeBlockIcon,
      active: state?.code,
      run: () => editor?.chain().focus().toggleCodeBlock().run(),
    },
  ]
  return (
    <div
      data-slot="rich-text-editor"
      data-render-ready={!!editor}
      className={cn(
        "overflow-hidden rounded-lg border bg-card focus-within:border-ring",
        className
      )}
    >
      <div
        role="group"
        aria-label="Formatting"
        className="flex flex-wrap items-center gap-0.5 border-b p-2"
      >
        <select
          aria-label="Text style"
          value={state?.heading ?? "0"}
          disabled={disabled || !editor}
          onChange={(e) => {
            const level = Number(e.target.value)
            if (level === 0) editor?.chain().focus().setParagraph().run()
            else
              editor
                ?.chain()
                .focus()
                .toggleHeading({ level: level as 1 | 2 | 3 })
                .run()
          }}
          className="me-1 h-8 rounded border bg-card px-2 text-xs"
        >
          <option value="0">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>
        {tools.map((tool) => (
          <Button
            key={tool.label}
            type="button"
            variant={tool.active ? "secondary" : "ghost"}
            size="icon-sm"
            aria-label={tool.label}
            aria-pressed={!!tool.active}
            disabled={disabled || !editor}
            onMouseDown={(e) => e.preventDefault()}
            onClick={tool.run}
          >
            <tool.icon />
          </Button>
        ))}
        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Insert link"
                disabled={disabled || !editor}
              />
            }
          >
            <LinkIcon />
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                try {
                  const url = new URL(link)
                  if (!["http:", "https:", "mailto:"].includes(url.protocol))
                    return
                  editor?.chain().focus().setLink({ href: url.href }).run()
                  setLinkOpen(false)
                } catch {
                  /* Native URL validation keeps invalid input in place. */
                }
              }}
              className="space-y-3"
            >
              <label
                className="block text-xs font-medium"
                htmlFor={`${linkId}-url`}
              >
                Link URL
              </label>
              <Input
                id={`${linkId}-url`}
                value={link}
                onChange={(e) => setLink(e.target.value)}
                type="url"
                required
                placeholder="https://"
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  Apply
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    editor?.chain().focus().unsetLink().run()
                    setLinkOpen(false)
                  }}
                >
                  Remove link
                </Button>
              </div>
            </form>
          </PopoverContent>
        </Popover>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Undo"
          disabled={disabled || !editor}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <ArrowCounterClockwiseIcon />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Redo"
          disabled={disabled || !editor}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <ArrowClockwiseIcon />
        </Button>
      </div>
      <div style={{ minHeight }}>
        {editor ? (
          <EditorContent editor={editor} />
        ) : (
          <p role="status" className="p-4 text-sm text-muted-foreground">
            Loading editor…
          </p>
        )}
      </div>
      {name && (
        <input
          type="hidden"
          name={name}
          value={state?.html ?? value ?? defaultValue}
        />
      )}
    </div>
  )
}
