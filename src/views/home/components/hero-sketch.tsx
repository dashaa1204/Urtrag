import Image from "next/image";

/*
  Бал үзгийн эскизийг давхарга болгон салгасан хувилбар. Ачаа зөөж яваа
  хүн бүр onгоцноос тусдаа PNG болсон тул дангаараа хөдөлж чадна.
  Давхаргуудыг `scripts/split-hero-sketch.py` үүсгэсэн — эх зураг солигдвол
  дахин ажиллуулна.

  left/top/width нь хувиар: эх зураг 712×425, хэмжээ нь responsive.
  duration/delay-г санаатай "дугуй бус" тоогоор өгсөн — бүгд нэг хэмнэлээр
  найгавал робот шиг харагдана.
*/
const PEOPLE = [
  { src: "/sketch/hero/person-1.png", width: 44, height: 74, left: 6.601, top: 79.294, size: 6.18, duration: "1.7s", delay: "0s" },
  { src: "/sketch/hero/person-2.png", width: 26, height: 60, left: 11.376, top: 53.412, size: 3.652, duration: "1.5s", delay: "-0.4s" },
  { src: "/sketch/hero/person-3.png", width: 41, height: 71, left: 12.5, top: 83.059, size: 5.758, duration: "1.9s", delay: "-0.9s" },
  { src: "/sketch/hero/person-4.png", width: 39, height: 59, left: 14.466, top: 56.941, size: 5.478, duration: "1.6s", delay: "-1.2s" },
  { src: "/sketch/hero/person-5.png", width: 43, height: 56, left: 70.365, top: 56.471, size: 6.039, duration: "1.8s", delay: "-0.2s" },
  { src: "/sketch/hero/person-6.png", width: 33, height: 56, left: 81.039, top: 64.235, size: 4.635, duration: "1.55s", delay: "-1.5s" },
  { src: "/sketch/hero/person-7.png", width: 38, height: 68, left: 87.64, top: 68.0, size: 5.337, duration: "1.75s", delay: "-0.7s" },
];

/** Нүүр хуудасны эскиз. Чимэглэл тул alt хоосон. */
export function HeroSketch({ className }: { className?: string }) {
  return (
    <div className={`hero-sketch relative select-none ${className ?? ""}`}>
      <Image
        src="/sketch/hero/plane.png"
        alt=""
        width={712}
        height={425}
        priority
        sizes="(min-width: 1024px) 460px, (min-width: 640px) 520px, 100vw"
        className="w-full"
      />

      {/*
        Хүмүүс жижиг (3-5KB) бөгөөд аль хэдийн шахагдсан тул `unoptimized` —
        LCP-ийн зам дээр зургийн оптимайзер руу 7 нэмэлт хүсэлт явуулах нь
        хэмнэх килобайтаас илүү өртөгтэй.
      */}
      {PEOPLE.map((person) => (
        <Image
          key={person.src}
          src={person.src}
          alt=""
          width={person.width}
          height={person.height}
          priority
          unoptimized
          className="hero-sketch-walk absolute"
          style={{
            left: `${person.left}%`,
            top: `${person.top}%`,
            width: `${person.size}%`,
            height: "auto",
            animationDuration: person.duration,
            animationDelay: person.delay,
          }}
        />
      ))}
    </div>
  );
}
