import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-5 py-12 lg:px-8">
      <article className="mx-auto max-w-[760px] rounded-lg border border-[var(--line)] bg-white p-6 sm:p-10">
        <p className="en text-sm font-bold text-[var(--accent-gold-dark)]">Privacy Policy</p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--text)]">개인정보처리방침</h1>
        <p className="mt-5 text-base leading-8 text-[var(--sub-text)]">ADS 아델슨은 문의 확인과 회신에 필요한 범위에서 개인정보를 처리합니다.</p>
        <div className="mt-8 grid gap-7 text-sm leading-7 text-[var(--sub-text)]">
          <section><h2 className="text-lg font-bold text-[var(--text)]">수집 항목</h2><p className="mt-2">회사명, 담당자명, 이메일, 연락처, 문의 내용, 첨부파일과 사용자가 선택해 입력한 정보</p></section>
          <section><h2 className="text-lg font-bold text-[var(--text)]">이용 목적</h2><p className="mt-2">문의 확인, 제품 상담, 견적 및 적용 검토, 자료 제공, 회신과 고객 응대</p></section>
          <section><h2 className="text-lg font-bold text-[var(--text)]">보유 및 파기</h2><p className="mt-2">문의 처리 목적을 달성한 정보는 지체 없이 파기합니다. 관계 법령에 따라 보존할 의무가 있는 경우에는 해당 법령에서 정한 기간 동안 분리 보관합니다.</p></section>
          <section><h2 className="text-lg font-bold text-[var(--text)]">동의 거부</h2><p className="mt-2">개인정보 수집 및 이용에 동의하지 않을 수 있으나, 필수정보 수집에 동의하지 않으면 문의 접수가 제한될 수 있습니다.</p></section>
        </div>
        <Link className="mt-10 inline-flex min-h-12 items-center rounded-md bg-[var(--primary)] px-5 font-bold text-white" href="/#inquiry">문의 화면으로 돌아가기</Link>
      </article>
    </main>
  );
}
