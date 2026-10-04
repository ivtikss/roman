import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { MotionLayer } from "@/components/MotionLayer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteSchema } from "@/components/SiteSchema";
import { ThreeFeature } from "@/components/ThreeFeature";
import styles from "./page.module.css";

const process = [
  {
    title: "Подготовка масс",
    body: "Карамель и мягкая начинка проходят подготовку в отдельных бункерах с подогревом.",
  },
  {
    title: "Коэкструзия",
    body: "Сжатый воздух направляет оба компонента к соплу: начинка оказывается внутри карамельного жгута.",
  },
  {
    title: "Формование",
    body: "Лента ведет жгут к паре синхронизированных колес, которые разделяют его на изделия.",
  },
  {
    title: "Отвод изделий",
    body: "Сформованная карамель перемещается по конвейеру к зоне сбора.",
  },
] as const;

const gallery = [
  {
    src: "/assets/prototype-feed-studio.webp",
    width: 1374,
    height: 1145,
    title: "Узел подачи",
    detail: "Воронка · сопло",
    alt: "Металлическая воронка, соединительный узел и наклонная подводящая трубка",
  },
  {
    src: "/assets/prototype-conveyor-refined.jpg",
    width: 1448,
    height: 1086,
    title: "Конвейер",
    detail: "Лента · привод",
    alt: "Конвейерный узел с ленточным транспортером и двумя формообразующими колесами",
  },
  {
    src: "/assets/prototype-forming-studio.webp",
    width: 1086,
    height: 1448,
    title: "Формообразующий узел",
    detail: "Колеса · синхронизация",
    alt: "Крупный план формообразующих колес на валах и направляющей механизма",
  },
] as const;

function FundingBand() {
  return (
    <aside className={styles.funding} aria-label="Поддержка проекта">
      <div className={styles.fundingInner}>
        <div className={styles.fundingLogos}>
          <Image
            src="/assets/fasie.svg"
            width={153}
            height={74}
            alt="Фонд содействия инновациям"
          />
          <Image
            src="/assets/platform-univertechpred.png"
            width={525}
            height={450}
            alt="Платформа университетского технологического предпринимательства"
          />
        </div>
        <p>
          Проект реализован при поддержке Фонда содействия инновациям в рамках программы
          «Студенческий стартап» мероприятия «Платформа университетского технологического
          предпринимательства» федерального проекта «Технологии».
        </p>
      </div>
    </aside>
  );
}

export default function Home() {
  return (
    <>
      <a className={styles.skipLink} href="#main">
        Перейти к содержанию
      </a>
      <FundingBand />
      <SiteHeader />
      <main id="main">
        <section className={styles.hero} id="top" aria-labelledby="hero-title">
          <div className={styles.heroVisual}>
            <Image
              className={styles.heroImage}
              src="/assets/hero-line.webp"
              alt="Общий вид карамельной линии: два бункера, конвейер, формообразующий механизм и мобильная рама"
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 1080px) 100vw, 700px"
            />
          </div>
          <div className={styles.heroWash} aria-hidden="true" />
          <div className={styles.heroInner}>
            <p className={styles.heroContext} data-hero-entrance>
              Кондитерское оборудование
            </p>
            <h1 id="hero-title" data-hero-entrance>
              Карамельная
              <br />
              линия
            </h1>
            <p className={styles.heroLead} data-hero-entrance>
              Леденцовая карамель с мягкой начинкой. Два компонента, один цикл.
            </p>
            <a className={styles.heroAction} href="#construction" data-hero-entrance>
              Устройство линии
              <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
            </a>
          </div>
          <div className={styles.heroFoot}>
            <span>Раздельная подача · коэкструзия · формование</span>
            <a href="#approach" aria-label="Перейти к технологии">
              <ArrowDown size={19} strokeWidth={1.8} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className={styles.approach} id="approach" aria-labelledby="approach-title">
          <div className={styles.container}>
            <div className={styles.sectionTop}>
              <p className={styles.sectionLabel}>Технология</p>
              <span>01 / 05</span>
            </div>
            <div className={styles.approachLead}>
              <h2 id="approach-title">Два потока.<br />Одна форма.</h2>
              <p>
                Карамельная масса образует внешнюю оболочку, мягкая начинка
                остается внутри. Компоненты соединяются в экструзионном узле,
                затем жгут движется по ленте к формообразующим колесам.
              </p>
            </div>
            <div className={styles.approachFlow} aria-label="Путь компонентов">
              <div>
                <span className={styles.flowMark} aria-hidden="true" />
                <h3>Карамельная масса</h3>
                <p>Бункер с нагревом и отдельным трактом подачи.</p>
              </div>
              <div>
                <span className={styles.flowMark} aria-hidden="true" />
                <h3>Мягкая начинка</h3>
                <p>Независимая емкость и подвод к общему соплу.</p>
              </div>
              <div>
                <span className={`${styles.flowMark} ${styles.flowMarkFilled}`} aria-hidden="true" />
                <h3>Жгут с начинкой</h3>
                <p>Карамельная оболочка вокруг мягкого центра.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.construction} id="construction" aria-labelledby="construction-title">
          <div className={styles.container}>
            <div className={styles.sectionTop}>
              <p className={styles.sectionLabel}>Конструкция</p>
              <span>02 / 05</span>
            </div>
            <div className={styles.constructionIntro}>
              <h2 id="construction-title">Устройство карамельной линии</h2>
              <p>
                Два бункера, экструзионный узел, ленточный конвейер и привод
                формообразования размещены на компактной мобильной раме.
              </p>
            </div>
            <figure className={styles.cadStage} data-feature-reveal>
              <Image
                src="/assets/cad-line.jpg"
                width={900}
                height={1238}
                sizes="(max-width: 700px) 85vw, 650px"
                alt="Трехмерная визуализация конструкции с двумя бункерами, конвейером и формообразующим узлом"
              />
              <figcaption>Компоновка линии · общий вид</figcaption>
            </figure>
            <dl className={styles.parts}>
              <div>
                <dt>Два бункера</dt>
                <dd>Раздельная подготовка карамельной массы и мягкой начинки.</dd>
              </div>
              <div>
                <dt>Формование</dt>
                <dd>Парные колеса у конвейера разделяют карамельный жгут.</dd>
              </div>
              <div>
                <dt>Управление</dt>
                <dd>Подача, движение ленты и вращение колес согласуются контроллером.</dd>
              </div>
            </dl>
            <div className={styles.cadDetails}>
              <figure>
                <Image
                  src="/assets/cad-feed.jpg"
                  width={1000}
                  height={884}
                  sizes="(max-width: 700px) 90vw, 45vw"
                  alt="Трехмерная визуализация узла подачи с двумя бункерами"
                />
                <figcaption><strong>Узел подачи</strong><span>Бункеры и экструдер</span></figcaption>
              </figure>
              <figure>
                <Image
                  src="/assets/cad-forming.jpg"
                  width={1200}
                  height={364}
                  sizes="(max-width: 700px) 90vw, 45vw"
                  alt="Трехмерная визуализация конвейера и формообразующего механизма"
                />
                <figcaption><strong>Формообразующий узел</strong><span>Лента и привод</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        <ThreeFeature />

        <section className={styles.process} id="process" aria-labelledby="process-title">
          <div className={styles.container}>
            <div className={styles.sectionTop}>
              <p className={styles.sectionLabel}>Принцип работы</p>
              <span>03 / 05</span>
            </div>
            <div className={styles.processIntro}>
              <h2 id="process-title">От массы к изделию</h2>
              <p>
                Раздельная подготовка компонентов, формирование жгута с начинкой,
                деление на изделия и отвод по конвейеру.
              </p>
            </div>
            <ol className={styles.processSteps}>
              {process.map(({ title, body }, index) => (
                <li key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={styles.materials} id="materials" aria-labelledby="materials-title">
          <div className={styles.container}>
            <div className={styles.sectionTop}>
              <p className={styles.sectionLabel}>Детали конструкции</p>
              <span>04 / 05</span>
            </div>
            <div className={styles.materialsIntro}>
              <h2 id="materials-title">Инженерия в деталях</h2>
              <p>
                От сопла и трактов подачи до конвейера и формообразующих колес:
                ключевые механизмы крупным планом.
              </p>
            </div>
            <div className={styles.gallery}>
              {gallery.map((item, index) => (
                <figure className={index === 1 ? styles.galleryWide : ""} key={item.src}>
                  <a
                    href={item.src}
                    target="_blank"
                    rel="noopener"
                    aria-label={`Открыть фотографию: ${item.title}`}
                  >
                    <Image
                      src={item.src}
                      width={item.width}
                      height={item.height}
                      sizes={index === 1 ? "(max-width: 700px) 90vw, 48vw" : "(max-width: 700px) 45vw, 24vw"}
                      loading={index === 1 ? "eager" : "lazy"}
                      alt={item.alt}
                    />
                  </a>
                  <figcaption><strong>{item.title}</strong><span>{item.detail}</span></figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.control} id="control" aria-labelledby="control-title">
          <div className={styles.container}>
            <div className={styles.sectionTop}>
              <p className={styles.sectionLabel}>Управление</p>
              <span>05 / 05</span>
            </div>
            <div className={styles.controlGrid}>
              <div>
                <h2 id="control-title">Каждый узел в одном ритме</h2>
                <p>
                  Температура, давление подачи и скорости приводов задают
                  последовательность операций. Открытая компоновка сохраняет
                  доступ к рабочим узлам.
                </p>
              </div>
              <div className={styles.controlList}>
                <article>
                  <span>01 / ПОДГОТОВКА</span>
                  <h3>Независимые бункеры</h3>
                  <p>Нагрев и подача компонентов настраиваются для каждого тракта.</p>
                </article>
                <article>
                  <span>02 / ДВИЖЕНИЕ</span>
                  <h3>Согласованные приводы</h3>
                  <p>Скорость конвейера и вращение формообразующих колес связаны рабочим циклом.</p>
                </article>
                <article>
                  <span>03 / ОБСЛУЖИВАНИЕ</span>
                  <h3>Доступ к механизмам</h3>
                  <p>Разъемные соединения и открытое расположение узлов упрощают обслуживание.</p>
                </article>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <div className={styles.container}>
          <p>Карамельная линия<span>Оборудование для леденцовой карамели с мягкой начинкой</span></p>
          <a href="#top">К началу страницы <ArrowUpRight size={16} aria-hidden="true" /></a>
        </div>
      </footer>
      <SiteSchema />
      <MotionLayer />
    </>
  );
}
