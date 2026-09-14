export default function PixelCloud({ children, width = 280 }) {
  return (
    <div style={{
      width: width,
      background: "#faf6ee",
      border: "1px solid #e8e0d6",
      borderRadius: 16,
      padding: "28px 24px 20px",
      textAlign: "center",
    }}>
      {children}
    </div>
  );
}
