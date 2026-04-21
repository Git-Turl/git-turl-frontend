import { ArrowRight, GitBranch, MessageSquare, Users } from 'lucide-react'

export function Onboarding() {
  const handleLogin = () => {
    window.location.href = import.meta.env.VITE_GITHUB_OAUTH_URL
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
    
      {/* ============ 상단 헤더 ============ */}
      <header style={{
        width: '100%',
        height: 70,
        background: 'white',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* 로고 */}
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <span style={{fontSize: 36}}>🪶</span>
          <div>
            <div style={{
              color: '#0E2248',
              fontSize: 22,
              fontFamily: 'Inter',
              fontWeight: 700
            }}>
              깃털
            </div>
            <div style={{
              color: '#00AEEF',
              fontSize: 12,
              fontFamily: 'Inter',
              fontWeight: 700
            }}>
              git-turl
            </div>
          </div>
        </div>

        {/* 우측 로그인 버튼 */}
        <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
          <span style={{
            color: '#828282',
            fontSize: 16,
            fontFamily: 'Inter',
            fontWeight: 600
          }}>
            깃털을 이용하고 계신가요?
          </span>
          <button
            onClick={handleLogin}
            style={{
              padding: '10px 24px',
              background: 'white',
              borderRadius: 12,
              border: '1px solid #00AEEF',
              color: '#00AEEF',
              fontSize: 16,
              fontFamily: 'Inter',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            로그인
          </button>
        </div>
      </header>

      {/* ============ 히어로 섹션 ============ */}
      <section style={{
        width: '100%',
        minHeight: 600,
        background: 'linear-gradient(125deg, #F4F7FE 0%, white 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '80px 120px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 왼쪽: 텍스트 + 로그인 버튼 */}
        <div style={{flex: 1, zIndex: 2}}>
          {/* 메인 제목 */}
          <h1 style={{
            color: 'black',
            fontSize: 56,
            fontFamily: 'Inter',
            fontWeight: 700,
            lineHeight: 1.3,
            marginBottom: 30
          }}>
            내 깃허브 레포지터리를<br/>
            한 눈에 요약하고 면접 준비까지!
          </h1>

          {/* 설명 */}
          <p style={{
            color: 'rgba(50, 73, 118, 0.75)',
            fontSize: 24,
            fontFamily: 'Inter',
            fontWeight: 700,
            lineHeight: 1.5,
            marginBottom: 50
          }}>
            깃털은 깃허브를 분석해 커밋을 분석해주고,<br/>
            면접 질문을 생성해주는 개발자 취업준비 서비스입니다.
          </p>

          {/* 로그인 버튼 */}
          <button
            onClick={handleLogin}
            style={{
              width: 440,
              height: 80,
              background: '#00AEEF',
              borderRadius: 100,
              border: 'none',
              color: 'white',
              fontSize: 28,
              fontFamily: 'Inter',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16
            }}
          >
            Git-hub로 로그인하기
            <ArrowRight size={32} color="white" />
          </button>
        </div>

        {/* 오른쪽: 일러스트 영역 (임시 박스) */}
        <div style={{
          width: 400,
          height: 400,
          background: '#F0F9FF',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          zIndex: 2
        }}>
          <div style={{
            color: '#00AEEF',
            fontSize: 20,
            fontFamily: 'Inter',
            fontWeight: 600,
            textAlign: 'center'
          }}>
            📊<br/>
            일러스트 영역
          </div>
        </div>

        {/* 배경 장식 원 (왼쪽 하단) */}
        <div style={{
          position: 'absolute',
          width: 600,
          height: 400,
          left: -100,
          bottom: -100,
          background: 'rgba(255, 255, 255, 0.62)',
          borderRadius: '50%',
          zIndex: 1
        }} />
      </section>

      {/* ============ dev 2: "왜 어려울까요?" 섹션 ============ */}
      <section style={{
        width: '100%',
        minHeight: 680,
        background: '#F0F9FF',
        padding: '90px 100px'
      }}>
        {/* 제목 */}
        <h2 style={{
          fontSize: 40,
          fontFamily: 'Inter',
          fontWeight: 700,
          marginBottom: 60
        }}>
          <span style={{color: 'black'}}>깃허브 분석, </span>
          <span style={{color: '#0084D1'}}>왜 어려울까요?</span>
        </h2>

        {/* 그래프 카드 */}
        <div style={{
          width: '100%',
          maxWidth: 1700,
          height: 400,
          background: 'white',
          borderRadius: 20,
          margin: '0 auto',
          padding: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 40
        }}>
          {/* 왼쪽: 회색 안내 박스 */}
          <div style={{
            flex: 1,
            height: 280,
            background: '#F2F2F2',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#828282',
            fontSize: 20,
            fontFamily: 'Inter',
            fontWeight: 500,
            textAlign: 'center',
            padding: 30
          }}>
            깃허브를 분석할 때 겪는 어려움을<br/>
            조사한 결과를 보여주는 영역입니다
          </div>

          {/* 오른쪽: 그래프 이미지 */}
          <div style={{
            width: 400,
            height: 280,
            background: 'rgba(217, 217, 217, 0.33)',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            flexDirection: 'column',
            gap: 10,
            color: 'white',
            fontSize: 28,
            fontFamily: 'Inter',
            fontWeight: 500
          }}>
            <div style={{color: '#00AEEF', fontSize: 60}}>📊</div>
            <div style={{color: '#00AEEF', fontSize: 20}}>
              구글폼 조사결과 그래프
            </div>
          </div>
        </div>
      </section>

      {/* ============ dev 3: 기능 소개 3개 카드 ============ */}
      <section style={{
        width: '100%',
        background: 'white',
        padding: '100px 100px'
      }}>
        {/* 장식 점 3개 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 30
        }}>
          <div style={{width: 10, height: 10, background: 'rgba(0, 132, 209, 0.32)', borderRadius: '50%'}} />
          <div style={{width: 10, height: 10, background: 'rgba(0, 132, 209, 0.32)', borderRadius: '50%'}} />
          <div style={{width: 10, height: 10, background: 'rgba(0, 132, 209, 0.32)', borderRadius: '50%'}} />
        </div>

        {/* 제목 */}
        <h2 style={{
          textAlign: 'center',
          fontSize: 48,
          fontFamily: 'Inter',
          fontWeight: 600,
          marginBottom: 30
        }}>
          <span style={{color: 'black'}}>깃털은 </span>
          <span style={{color: '#0084D1'}}>커밋</span>
          <span style={{color: 'black'}}>을 분석합니다!</span>
        </h2>

        {/* 부제목 */}
        <p style={{
          textAlign: 'center',
          color: 'rgba(50, 73, 118, 0.75)',
          fontSize: 24,
          fontFamily: 'Inter',
          fontWeight: 700,
          lineHeight: 1.5,
          marginBottom: 80
        }}>
          분석부터 요약본 생성으로 나의 레포지터리를 한 눈에,<br/>
          면접 질문 생성, 피드백으로 개발자의 성장을 위한 기능을 담았습니다.
        </p>

        {/* 3개 카드 영역 */}
        <div style={{
          display: 'flex',
          gap: 30,
          justifyContent: 'center',
          maxWidth: 1700,
          margin: '0 auto'
        }}>
          {/* 카드 1: 깃허브 분석본 */}
          <div style={{
            flex: 1,
            maxWidth: 500,
            height: 570,
            background: 'white',
            borderRadius: 12,
            border: '1px solid #D9D9D9',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.14)',
            padding: 30,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* 번호 + 제목 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              marginBottom: 30
            }}>
              <div style={{
                width: 50, height: 50,
                background: '#00AEEF',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 20,
                fontFamily: 'Inter',
                fontWeight: 700,
                flexShrink: 0
              }}>
                01
              </div>
              <div style={{
                color: 'black',
                fontSize: 30,
                fontFamily: 'Inter',
                fontWeight: 700
              }}>
                깃허브 분석본 제공
              </div>
            </div>

            {/* 설명 */}
            <p style={{
              textAlign: 'center',
              color: '#828282',
              fontSize: 22,
              fontFamily: 'Inter',
              fontWeight: 700,
              lineHeight: 1.5,
              marginBottom: 40
            }}>
              선택한 레포지터리의<br/>
              내용을 분석한 분석본을 제공
            </p>

            {/* 미리보기 박스 */}
            <div style={{
              flex: 1,
              background: 'rgba(217, 217, 217, 0.33)',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 15
            }}>
              <GitBranch size={60} color="#00AEEF" />
              <div style={{
                color: '#00AEEF',
                fontSize: 18,
                fontFamily: 'Inter',
                fontWeight: 600,
                justifyContent: 'center'  
              }}>
                분석본 미리보기
              </div>
            </div>
          </div>

          {/* 카드 2: 면접 질문 & 답변 */}
          <div style={{
            flex: 1,
            maxWidth: 500,
            height: 570,
            background: 'white',
            borderRadius: 12,
            border: '1px solid #D9D9D9',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.14)',
            padding: 30,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* 번호 + 제목 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              marginBottom: 30
            }}>
              <div style={{
                width: 50, height: 50,
                background: '#00AEEF',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 20,
                fontFamily: 'Inter',
                fontWeight: 700,
                flexShrink: 0
              }}>
                02
              </div>
              <div style={{
                color: 'black',
                fontSize: 30,
                fontFamily: 'Inter',
                fontWeight: 700,
                justifyContent: 'center' 
              }}>
                면접 질문 & 답변 생성
              </div>
            </div>

            <p style={{
              textAlign: 'center',
              color: '#828282',
              fontSize: 22,
              fontFamily: 'Inter',
              fontWeight: 700,
              lineHeight: 1.5,
              marginBottom: 40
            }}>
              생성한 요약본을 바탕으로<br/>
              면접 질문과 답변 생성
            </p>

            <div style={{
              flex: 1,
              background: 'rgba(217, 217, 217, 0.33)',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 15
            }}>
              <MessageSquare size={60} color="#00AEEF" />
              <div style={{
                color: '#00AEEF',
                fontSize: 18,
                fontFamily: 'Inter',
                fontWeight: 600,
                justifyContent: 'center'
              }}>
                면접 질문 예시
              </div>
            </div>
          </div>

          {/* 카드 3: 프로젝트 게시판 */}
          <div style={{
            flex: 1,
            maxWidth: 500,
            height: 570,
            background: 'white',
            borderRadius: 12,
            border: '1px solid #D9D9D9',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.14)',
            padding: 30,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* 번호 + 제목 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              marginBottom: 30
            }}>
              <div style={{
                width: 50, height: 50,
                background: '#00AEEF',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 20,
                fontFamily: 'Inter',
                fontWeight: 700,
                flexShrink: 0
              }}>
                03
              </div>
              <div style={{
                color: 'black',
                fontSize: 30,
                fontFamily: 'Inter',
                fontWeight: 700
              }}>
                프로젝트 게시판 운영
              </div>
            </div>

            <p style={{
              textAlign: 'center',
              color: '#828282',
              fontSize: 22,
              fontFamily: 'Inter',
              fontWeight: 700,
              lineHeight: 1.5,
              marginBottom: 40
            }}>
              커뮤니티에 프로젝트 팀을<br/>
              모집할 수 있는 프로젝트 게시판 운영
            </p>

            <div style={{
              flex: 1,
              background: 'rgba(217, 217, 217, 0.33)',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 15
            }}>
              <Users size={60} color="#00AEEF" />
              <div style={{
                color: '#00AEEF',
                fontSize: 18,
                fontFamily: 'Inter',
                fontWeight: 600
              }}>
                프로젝트 게시판
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Step 4-1: 하단 CTA 섹션 ============ */}
      <section style={{
        width: '100%',
        minHeight: 400,
        background: 'linear-gradient(90deg, #F5F7FE 0%, white 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 100px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 왼쪽 배경 장식 원 (화면 왼쪽 밖으로 크게 삐져나감) */}
        <div style={{
          position: 'absolute',
          width: 600,
          height: 600,
          left: -130,
          top: -100,
          background: '#00AEEF',
          borderRadius: '50%',
          border: '40px solid rgba(234, 242, 255, 0.76)',
          zIndex: 1
        }} />

        {/* 중앙 컨텐츠 */}
        <div style={{
          textAlign: 'center',
          zIndex: 2,
          position: 'relative'
        }}>
          {/* 제목 */}
          <h2 style={{
            fontSize: 44,
            fontFamily: 'Inter',
            fontWeight: 700,
            marginBottom: 20
          }}>
            <span style={{color: 'black'}}>지금 바로 </span>
            <span style={{color: '#0084D1'}}>깃털</span>
            <span style={{color: 'black'}}>을 시작해보세요!</span>
          </h2>

          {/* 부제목 */}
          <p style={{
            color: '#828282',
            fontSize: 24,
            fontFamily: 'Inter',
            fontWeight: 700,
            marginBottom: 50
          }}>
            당신의 개발 여정을 깃털이 함께 응원합니다.
          </p>

          {/* CTA 버튼 */}
          <button
            onClick={handleLogin}
            style={{
              width: 440,
              height: 80,
              background: '#00AEEF',
              borderRadius: 100,
              border: 'none',
              color: 'white',
              fontSize: 28,
              fontFamily: 'Inter',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16
            }}
          >
            Git-hub로 가입하기
            <ArrowRight size={32} color="white" />
          </button>
        </div>
      </section>

      {/* ============ Step 4-2: 푸터 ============ */}
      <footer style={{
        width: '100%',
        background: 'white',
        padding: '50px 60px',
        borderTop: '1px solid #F0F0F0'
      }}>
        {/* 푸터 상단: 서비스명 + 약관 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20
        }}>
          {/* 왼쪽 */}
          <div>
            <div style={{
              color: '#D5D3D3',
              fontSize: 20,
              fontFamily: 'Inter',
              fontWeight: 700,
              marginBottom: 10
            }}>
              깃털 (Git-Turl)
            </div>
            <div style={{
              color: '#D5D3D3',
              fontSize: 16,
              fontFamily: 'Inter',
              fontWeight: 400
            }}>
              Contact us: gitturl@gmail.com
            </div>
          </div>

          {/* 오른쪽: 약관 */}
          <div style={{
            color: '#D5D3D3',
            fontSize: 16,
            fontFamily: 'Inter',
            fontWeight: 400
          }}>
            이용약관 | 개인정보처리방침 | 이메일무단수집거부
          </div>
        </div>

        {/* 구분선 */}
        <div style={{
          width: '100%',
          height: 1,
          background: '#D5D3D3',
          opacity: 0.5,
          marginTop: 20,
          marginBottom: 15
        }} />

        {/* 푸터 하단: 저작권 */}
        <div style={{
          color: '#D5D3D3',
          fontSize: 14,
          fontFamily: 'Inter',
          fontWeight: 400
        }}>
          Copyright © 2026 루트. All Rights Reserved.
        </div>
      </footer>

    </div>
  )
}