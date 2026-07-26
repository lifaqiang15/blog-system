'use client'

import { Tiptap, useEditor, useTiptap, useTiptapState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold, Italic, Strikethrough, Code, Code2,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Undo, Redo,
} from 'lucide-react'

function ToolbarBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex h-7 w-7 items-center justify-center rounded text-sm transition-colors ${
        active
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      } disabled:pointer-events-none disabled:opacity-40`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span className="mx-0.5 h-4 w-px shrink-0 bg-gray-200" />
}

function Toolbar() {
  const { editor } = useTiptap()

  const isBold       = useTiptapState((s) => s.editor.isActive('bold'))
  const isItalic     = useTiptapState((s) => s.editor.isActive('italic'))
  const isStrike     = useTiptapState((s) => s.editor.isActive('strike'))
  const isCode       = useTiptapState((s) => s.editor.isActive('code'))
  const isH1         = useTiptapState((s) => s.editor.isActive('heading', { level: 1 }))
  const isH2         = useTiptapState((s) => s.editor.isActive('heading', { level: 2 }))
  const isH3         = useTiptapState((s) => s.editor.isActive('heading', { level: 3 }))
  const isBullet     = useTiptapState((s) => s.editor.isActive('bulletList'))
  const isOrdered    = useTiptapState((s) => s.editor.isActive('orderedList'))
  const isBlockquote = useTiptapState((s) => s.editor.isActive('blockquote'))
  const isCodeBlock  = useTiptapState((s) => s.editor.isActive('codeBlock'))
  const canUndo      = useTiptapState((s) => s.editor.can().undo())
  const canRedo      = useTiptapState((s) => s.editor.can().redo())

  if (!editor) return null

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={isBold} title="加粗 (Ctrl+B)">
        <Bold className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={isItalic} title="斜体 (Ctrl+I)">
        <Italic className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={isStrike} title="删除线">
        <Strikethrough className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={isCode} title="行内代码">
        <Code className="h-3.5 w-3.5" />
      </ToolbarBtn>

      <Divider />

      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={isH1} title="标题 1">
        <Heading1 className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={isH2} title="标题 2">
        <Heading2 className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={isH3} title="标题 3">
        <Heading3 className="h-3.5 w-3.5" />
      </ToolbarBtn>

      <Divider />

      <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={isBullet} title="无序列表">
        <List className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={isOrdered} title="有序列表">
        <ListOrdered className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={isBlockquote} title="引用">
        <Quote className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={isCodeBlock} title="代码块">
        <Code2 className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="分割线">
        <Minus className="h-3.5 w-3.5" />
      </ToolbarBtn>

      <Divider />

      <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={!canUndo} title="撤销 (Ctrl+Z)">
        <Undo className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={!canRedo} title="重做 (Ctrl+Y)">
        <Redo className="h-3.5 w-3.5" />
      </ToolbarBtn>
    </div>
  )
}

export type TiptapEditorProps = {
  onChange?: (json: object) => void
  initialContent?: object | null
  editable?: boolean
}

export default function TiptapEditor({ onChange, initialContent, editable = true }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent || '',
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (editable) onChange?.(editor.getJSON())
    },
  })

  if (!editor) return null

  return (
    <div className={`tiptap-editor overflow-hidden rounded-lg bg-white ${editable ? 'border border-gray-200' : 'tiptap-readonly select-text'}`}>
      <Tiptap editor={editor}>
        {editable && <Toolbar />}
        <Tiptap.Content />
      </Tiptap>
    </div>
  )
}
