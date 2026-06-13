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
    // PC에서 이미지 파일 선택 → 캔버스 리사이즈/JPEG 압축 후 base64로 본문에 삽입.
    // 본문에 인라인되기 때문에 원본을 그대로 박으면 게시글 JSON 페이로드가 폭발함.
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      // 원본 10MB 까지 허용 (압축 후 보통 수백 KB).
      const MAX_BYTES = 10 * 1024 * 1024;
      if (file.size > MAX_BYTES) {
        alert('이미지 크기가 너무 큽니다 (최대 10MB).');
        return;
      }
      try {
        // 작은 이미지는 캔버스 변환 건너뛰고 그대로 인코딩 (메인 스레드 블록 시간 최소화).
        const SKIP_COMPRESS_BYTES = 300 * 1024;
        const dataUrl =
          file.size < SKIP_COMPRESS_BYTES
            ? await readFileAsDataUrl(file)
            : await compressImageToDataUrl(file);
        editor.chain().focus().setImage({ src: dataUrl }).run();
      } catch (e) {
        console.error('[RichTextEditor] 이미지 처리 실패', e);
        alert('이미지 처리 중 오류가 발생했습니다.');
      }
    };
    input.click();
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

// 파일을 그대로 base64 dataURL로 읽기 (이미 작아서 압축 불필요한 경우).
async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('FileReader result is not a string'));
    };
    reader.onerror = () => reject(new Error('파일 읽기 실패'));
    reader.readAsDataURL(file);
  });
}

// 이미지 파일 → 리사이즈 + JPEG 압축된 dataURL 변환.
// - 최장변 1280px 로 다운스케일 (이미 그보다 작으면 그대로)
// - JPEG 0.8 품질 — 일반 사진/스크린샷 기준 원본 대비 ~10% 수준까지 줄어듦
// - 투명 PNG 입력 시 JPEG 변환되면 알파가 사라지므로 흰 배경 채워줌
async function compressImageToDataUrl(
  file: File,
  maxDim = 1280,
  quality = 0.8
): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('이미지 로드 실패'));
      el.src = url;
    });
    let w = img.naturalWidth;
    let h = img.naturalHeight;
    if (Math.max(w, h) > maxDim) {
      const ratio = maxDim / Math.max(w, h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas 2d context 사용 불가');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    URL.revokeObjectURL(url);
  }
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
