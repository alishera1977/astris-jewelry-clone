/**
 * Статичная разметка под те же классы, что в index.html.
 * Для Next.js: после mount вызовите initPackagingCarousel() из main.js
 * или перенесите логику карусели в клиентский хук.
 */
export default function PackagingSection() {
  return (
    <section
      className="packaging-section"
      id="packaging"
      data-header="light"
      aria-labelledby="packaging-heading"
    >
      <div className="packaging-section__top">
        <div className="packaging-section__heading">
          <p className="packaging-section__label">УПАКОВКА</p>
          <h2 className="packaging-section__title" id="packaging-heading">
            Ритуал
            <br />
            распаковки
          </h2>
        </div>
        <p className="packaging-section__text">
          Каждое изделие приходит в фирменной коробке и крафтовом пакете с авторской графикой — как продолжение
          личного ритуала.
        </p>
      </div>
      <div
        className="packaging-section__gallery packaging-carousel"
        id="packaging-carousel"
        role="region"
        aria-roledescription="карусель"
        aria-label="Упаковка ASTRIS"
      >
        <div className="packaging-carousel__viewport" tabIndex={0}>
          <div className="packaging-carousel__track">
            <div className="packaging-carousel__slide">
              <img
                className="packaging-section__image"
                src="/images/packaging-1.png"
                alt="Фирменные пакеты ASTRIS — белый и крафт"
                width={1600}
                height={900}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="packaging-carousel__slide">
              <img
                className="packaging-section__image"
                src="/images/packaging-2.png"
                alt="Белый фирменный пакет с текстильными ручками"
                width={1600}
                height={900}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="packaging-carousel__slide">
              <img
                className="packaging-section__image"
                src="/images/packaging-3.png"
                alt="Фирменные коробки ASTRIS на мраморной поверхности"
                width={1600}
                height={900}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
        <button type="button" className="packaging-carousel__btn packaging-carousel__btn--prev" aria-label="Предыдущее фото">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M14 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button type="button" className="packaging-carousel__btn packaging-carousel__btn--next" aria-label="Следующее фото">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M10 6l6 6-6 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="packaging-carousel__dots" role="tablist" aria-label="Номер слайда" />
      </div>
    </section>
  );
}
