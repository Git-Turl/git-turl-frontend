import { useState } from 'react';
import { X, Check } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedStacks: string[]) => void;
};

type StackState = {
  selected: boolean;
  liked: boolean;
};

const stackData = {
  프론트: {
    웹: [
      'HTML/CSS',
      'Tailwind CSS',
      'JavaScript',
      'TypeScript',
      'React',
      'Vue.js',
      'Next.js',
      'Svelte',
      'Angular',
      'jQuery',
    ],
    모바일: [
      'React Native',
      'Flutter',
      'Xamarin',
      'Swift',
      'Kotlin',
      'Android',
    ],
  },
  백엔드: {
    백엔드: [
      'PHP',
      'Node.js',
      'Nest.js',
      'SpringBoot',
      'Django',
      'Flask',
      'FastAPI',
      'Ruby on Rails',
      'ASP.NET',
      'Go',
      'Rust',
    ],
  },
  AI: {
    AI: [
      'TensorFlow',
      'PyTorch',
      'scikit-learn',
      'Keras',
      'Hugging Face',
      'LangChain',
      'OpenAI API',
      'NumPy',
      'Pandas',
    ],
  },
};

type FieldType = '프론트' | '백엔드' | 'AI';

export function StackSelectModal({ isOpen, onClose, onSave }: Props) {
  const [activeTab, setActiveTab] = useState<FieldType>('프론트');
  const [stackStates, setStackStates] = useState<Record<string, StackState>>(
    {}
  );

  if (!isOpen) return null;

  const categories = stackData[activeTab];

  const getState = (stack: string): StackState => {
    return stackStates[stack] || { selected: false, liked: false };
  };

  const handleNameClick = (stack: string) => {
    const current = getState(stack);
    const newState: StackState = current.selected
      ? { selected: false, liked: false }
      : { selected: true, liked: true };

    setStackStates({
      ...stackStates,
      [stack]: newState,
    });
  };

  const handleCheckboxClick = (stack: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = getState(stack);
    const newLiked = !current.liked;
    const newState: StackState = {
      liked: newLiked,
      selected: newLiked ? current.selected : false,
    };

    setStackStates({
      ...stackStates,
      [stack]: newState,
    });
  };

  const handleSave = () => {
    // selected=true이거나 liked=true인 스택 모두 포함
    const allSelected = Object.entries(stackStates)
      .filter(([_, state]) => state.selected || state.liked)
      .map(([name]) => name);

    console.log('선택된 기술:', allSelected);

    // 부모에게 전달
    onSave(allSelected);
    onClose();
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.2)',
          zIndex: 100,
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 950,
          height: 600,
          background: 'white',
          borderRadius: 12,
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
          zIndex: 101,
          padding: '50px 60px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 15,
            right: 15,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 5,
          }}
        >
          <X color="#00AEEF" size={28} />
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <span
              style={{
                color: 'black',
                fontSize: 32,
                fontFamily: 'Inter',
                fontWeight: 500,
              }}
            >
              스택 선택하기
            </span>
            <span
              style={{
                color: '#989898',
                fontSize: 20,
                fontFamily: 'Inter',
                fontWeight: 500,
              }}
            >
              | 구현 가능한 스택을 클릭해주세요
            </span>
          </div>

          <div style={{ display: 'flex' }}>
            {(['프론트', '백엔드', 'AI'] as FieldType[]).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    width: 100,
                    height: 40,
                    background: isActive ? '#00AEEF' : 'white',
                    color: isActive ? 'white' : '#00AEEF',
                    border: '1px solid #00AEEF',
                    fontSize: 18,
                    fontFamily: 'Inter',
                    fontWeight: 560,
                    cursor: 'pointer',
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 10 }}>
          {Object.keys(categories).length === 0 ? (
            <div
              style={{
                color: '#989898',
                fontSize: 20,
                textAlign: 'center',
                padding: '100px 0',
              }}
            >
              아직 준비 중인 분야입니다
            </div>
          ) : (
            Object.entries(categories).map(([category, stacks]) => (
              <div key={category} style={{ marginBottom: 30 }}>
                <div
                  style={{
                    color: 'black',
                    fontSize: 24,
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    marginBottom: 15,
                  }}
                >
                  {category}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 15,
                  }}
                >
                  {stacks.map((stack) => {
                    const state = getState(stack);
                    return (
                      <div
                        key={stack}
                        onClick={() => handleNameClick(stack)}
                        style={{
                          width: '100%',
                          height: 50,
                          background: state.selected ? '#F0F9FF' : 'white',
                          borderRadius: 10,
                          border: state.selected
                            ? '2px solid #00AEEF'
                            : '2px solid #D9D9D9',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 15px',
                          gap: 10,
                          cursor: 'pointer',
                          boxSizing: 'border-box',
                          userSelect: 'none',
                        }}
                      >
                        <div
                          onClick={(e) => handleCheckboxClick(stack, e)}
                          style={{
                            width: 24,
                            height: 24,
                            border: state.liked
                              ? '2px solid #00AEEF'
                              : '2px solid #828282',
                            background: state.liked ? '#00AEEF' : 'white',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            cursor: 'pointer',
                          }}
                        >
                          {state.liked && (
                            <Check color="white" size={16} strokeWidth={3} />
                          )}
                        </div>
                        <span
                          style={{
                            color: state.selected ? '#00AEEF' : '#808080',
                            fontSize: 18,
                            fontFamily: 'Inter',
                            fontWeight: 500,
                          }}
                        >
                          {stack}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 20,
            borderTop: '1px solid #F0F0F0',
            marginTop: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 18,
                height: 18,
                border: '2px solid #F50000',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Check color="#F50000" size={12} strokeWidth={3} />
            </div>
            <span
              style={{
                color: '#F50000',
                fontSize: 18,
                fontFamily: 'Inter',
                fontWeight: 400,
              }}
            >
              선호스택은 체크박스만 선택해주세요
            </span>
          </div>

          <button
            onClick={handleSave}
            style={{
              width: 180,
              height: 50,
              background: 'white',
              borderRadius: 10,
              border: '2px solid #00AEEF',
              color: '#00AEEF',
              fontSize: 18,
              fontFamily: 'Inter',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            저장하기
          </button>
        </div>
      </div>
    </>
  );
}