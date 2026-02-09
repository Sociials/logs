'use client';

export default function AsciiBackground() {
  return (
    <div className="ascii-bg" aria-hidden="true">
      {/* Top-right corner decoration */}
      <pre className="ascii-art top-right">
        {`        ·  ·  ·  ·  ·  ·
      ·  ·  ·  ·  ·  ·  ·
    ·  ·  ·  ·  ·  ·  ·  ·
  ·  ·  ·  ·  ·  ·  ·  ·  ·
·  ·  ·  ·  ·  ·  ·  ·  ·  ·`}
      </pre>

      {/* Bottom-left corner decoration */}
      <pre className="ascii-art bottom-left">
        {`·  ·  ·  ·  ·  ·  ·  ·  ·  ·
  ·  ·  ·  ·  ·  ·  ·  ·  ·
    ·  ·  ·  ·  ·  ·  ·  ·
      ·  ·  ·  ·  ·  ·  ·
        ·  ·  ·  ·  ·  ·`}
      </pre>

      {/* Center-right subtle pattern */}
      <pre className="ascii-art center-right">
        {`│
│
│
│
│
│
│
│`}
      </pre>

      {/* Subtle grid pattern */}
      <div className="grid-pattern"></div>
    </div>
  );
}
