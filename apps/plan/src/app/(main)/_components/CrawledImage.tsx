// 네이버 CDN 이미지는 외부 사이트에서 요청을 차단한다.
// referrerPolicy="no-referrer" 설정을 위해 <img> 태그를 직접 사용한다.
export function CrawledImage({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  return <img src={src} alt={alt} referrerPolicy="no-referrer" className={className} />
}

// 크롤링 뱃지
export function CrawledSourceBadge() {
  return (
    <span className="w-fit rounded-full bg-gray-100 px-2.5 py-0.5 text-r-12 text-gray-600">
      네이버 블로그
    </span>
  )
}
