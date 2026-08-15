import "./H7Hero.css";

export default function H7Hero({ image }) {
  return (
    <section className="h7-hero">

      <div className="h7-image">

        <img src={image} alt="" />

      </div>

      <div className="h7-card">

        <div className="placeholder title"></div>

        <div className="placeholder line"></div>

        <div className="placeholder line short"></div>

        <div className="heart-divider">

          <span></span>

          <div className="heart">❤</div>

          <span></span>

        </div>

      </div>

    </section>
  );
}