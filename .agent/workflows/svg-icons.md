---
description: UI 개발 시 이모지 대신 SVG 아이콘 사용
---

# 이모지 → SVG 아이콘 교체 규칙

## 배경
이모지(🎙️, 🛡️, 📈 등)는 브라우저/OS에 따라 렌더링이 다르고, 일부 환경에서 깨질 수 있습니다.
**UI에서 이모지 대신 lucide-react 또는 SVG 아이콘을 사용해야 합니다.**

## 적용 방법

### 1. lucide-react 아이콘 사용 (권장)
```tsx
import { Mic, Shield, TrendingUp } from "lucide-react";

// 사용 예시
<Mic className="w-6 h-6 text-[#10b981]" />
<Shield className="w-6 h-6 text-[#10b981]" />
<TrendingUp className="w-6 h-6 text-[#10b981]" />
```

### 2. 인라인 SVG 사용
```tsx
<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="..." />
</svg>
```

## 이모지 → 아이콘 매핑 예시
| 이모지 | lucide-react 아이콘 |
|:---:|:---|
| 🎙️ | `Mic` |
| 🛡️ | `Shield` |
| 📈 | `TrendingUp` |
| ✅ | `Check` 또는 `CheckCircle` |
| ⚙️ | `Settings` |
| 👤 | `User` |
| 🏠 | `Home` |

## 주의사항
- 반응형 크기: `w-5 h-5 md:w-6 md:h-6`
- 색상: Tailwind 클래스 사용 (`text-[#10b981]`)
- 접근성: `aria-hidden="true"` 또는 적절한 `aria-label` 추가
