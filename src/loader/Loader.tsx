import { useState, useEffect } from "react";
import { Svg1 } from "./Svg1";
import { Svg2 } from "./Sgv2";
import { Svg3 } from "./Svg3";
import { Svg4 } from "./Svg4";
import { Svg5 } from "./Svg.5";

const Loader = ({ message = "Cargando..." }) => {
  const svgs = [<Svg1 />, <Svg2 />, <Svg3 />, <Svg4 />, <Svg5 />];
  const [opacities, setOpacities] = useState([1, 0, 0, 0, 0]);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    let currentSvg = 0;

    const interval = setInterval(() => {
      setOpacities((prevOpacities) => {
        const newOpacities = prevOpacities.map((_, index) =>
          index === (currentSvg + 1) % svgs.length ? 1 : 0
        );
        return newOpacities;
      });

      currentSvg = (currentSvg + 1) % svgs.length;
    }, 924);

    // Animación de bounce
    const bounceInterval = setInterval(() => {
      setBounce((prev) => !prev);
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(bounceInterval);
    };
  }, [svgs.length]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "#374151",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      {/* Logo animado */}
      <div
        style={{
          position: "relative",
          width: "200px",
          height: "200px",
          marginBottom: "30px",
        }}
      >
        {svgs.map((SvgComponent, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: opacities[index],
              transition: "opacity 500ms ease-in-out",
            }}
          >
            {SvgComponent}
          </div>
        ))}
      </div>

      {/* Texto de carga */}
      <p
        style={{
          fontSize: "2.5rem",
          color: "white",
          fontWeight: "bold",
          fontFamily: "system-ui, sans-serif",
          transform: bounce ? "translateY(-10px)" : "translateY(0)",
          transition: "transform 0.3s ease-in-out",
        }}
      >
        {message}
      </p>
      <p
        style={{
          marginTop: "15px",
          fontSize: "1.2rem",
          color: "rgba(255, 255, 255, 0.8)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Por favor espere un momento...
      </p>
    </div>
  );
};

export default Loader;
