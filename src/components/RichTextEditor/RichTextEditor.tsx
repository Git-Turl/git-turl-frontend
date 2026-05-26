import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
// 참고: Link, Underline은 최신 @tiptap/starter-kit에 이미 포함되어 있어 별도 import 불필요
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import './editor.css';

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = '내용을 입력하세요',
  minHeight = 360,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        },
      }),
      Image,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'rte-content',
        style: `min-height:${minHeight}px;`,
      },
    },
  });

  // 외부에서 value가 비워졌을 때 (예: 초기화) 에디터도 동기화
  useEffect(() => {
    if (!editor) return;
    if (value === '' && editor.getHTML() !== '<p></p>') {
      editor.commands.setContent('');
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div
        style={{
          border: '1px solid #DADADA',
          borderRadius: 12,
          height: minHeight + 48,
        }}
      />
    );
  }

  const isActive = (name: string, attrs?: Record<string, unknown>) =>
    editor.isActive(name, attrs);

  const insertLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('링크 URL을 입력하세요', previous ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertImage = () => {
    const url = window.prompt('이미지 URL을 입력하세요', 'https://');
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div
      style={{
        border: '1px solid #DADADA',
        borderRadius: 12,
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      <div
        style={{
          height: 48,
          background: '#F2F2F2',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '0 12px',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <ToolBtn
          title="왼쪽 정렬"
          active={isActive({ textAlign: 'left' } as never)}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeft size={16} />
        </ToolBtn>
        <ToolBtn
          title="가운데 정렬"
          active={isActive({ textAlign: 'center' } as never)}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenter size={16} />
        </ToolBtn>
        <ToolBtn
          title="오른쪽 정렬"
          active={isActive({ textAlign: 'right' } as never)}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <AlignRight size={16} />
        </ToolBtn>

        <Divider />

        <ToolBtn
          title="굵게"
          active={isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </ToolBtn>
        <ToolBtn
          title="기울임"
          active={isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </ToolBtn>
        <ToolBtn
          title="밑줄"
          active={isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={16} />
        </ToolBtn>
        <ToolBtn
          title="취소선"
          active={isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={16} />
        </ToolBtn>

        <Divider />

        <ToolBtn title="링크" active={isActive('link')} onClick={insertLink}>
          <LinkIcon size={16} />
        </ToolBtn>
        <ToolBtn title="이미지" onClick={insertImage}>
          <ImageIcon size={16} />
        </ToolBtn>
        <ToolBtn
          title="코드 블록"
          active={isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code size={16} />
        </ToolBtn>
      </div>

      <div style={{ padding: '20px 24px' }}>
        {editor.isEmpty && (
          <div
            style={{
              position: 'absolute',
              color: '#BFBFBF',
              pointerEvents: 'none',
              fontSize: 14,
            }}
          >
            {placeholder}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolBtn({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        width: 30,
        height: 30,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: active ? '#E0F2FE' : 'transparent',
        color: active ? '#00AEEF' : '#4A5565',
        border: 'none',
        borderRadius: 6,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <span
      style={{
        width: 1,
        height: 18,
        background: '#D1D5DB',
        margin: '0 4px',
      }}
    />
  );
}
