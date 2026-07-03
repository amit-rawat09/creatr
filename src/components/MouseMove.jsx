import React from "react";
import { useEffect, useState } from "react";
function MouseMove() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect((e) => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      style={{
        left: mousePosition.x - 150,
        top: mousePosition.y - 150,
        transition: "all 0.3s ease-out",
      }}
      className="fixed w-96 h-96 bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none z-0"
    ></div>
  );
}

export default MouseMove;
