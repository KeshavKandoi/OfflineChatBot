import Silk from "./Silk";

export default function SilkBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: "#120f17",
        pointerEvents: "none",
      }}
    >
      <Silk
        speed={5}
        scale={1}
        color="#7B7481"
        noiseIntensity={1.5}
        rotation={0}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(18,15,23,0.25), rgba(18,15,23,0.75))",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}