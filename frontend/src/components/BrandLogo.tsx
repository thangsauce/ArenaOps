/** Inline AO monogram — uses app theme vars so it responds to dark/light toggle */
export default function BrandLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <defs>
        <style>{`
          @font-face {
            font-family: 'BebasAO';
            src: url('data:font/woff2;base64,d09GMgABAAAAAAJ4AA4AAAAABUAAAAImAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGhYbdBwqBmAAPBEICoEEgQsBNgIkAwwLCAAEIAWDRAcgG0wEIK4KbGNmcA9Cw9gMDeo74pHPVqJGEK2hs3sfBJUSSkBJhEaQKytZhSBk0FaVXW1uam5TRCvxI+JJVPrUf4hljgSpkTI6PMRpkGiVFFlWEh3odMG3WyUqrgaIM5XXh7PW53z6m/pnET2EgCPowk0Q4NhgofzzxgSdHkPimN2QWEyGt+jwyQLdgBBSCIFOCxVhm7fOdkjk9gWoIxEN1CoQt67YOuJDIDRSu9AuzURgoTRMQUudpk4jJIUBVqZxsbge2wNAiftxtJAP0iF2pS+Ms1bxyK7W1sxsyUAAwObtmznS0rYsPT1KeREJEZDv8mMuHImCYbjAMMJSiFaNkDZY1go9vH6qCkCIWvWBAlrRYBHEKghoACk7mt7Oc13RqQKHO+1kwMeKcnei6+GYvDPaOVE7nSvzuuqtvmXonTX0uvrzZScSJxw75NTO3MVwvdZoidny7JfLfDSCQCBZ/w/ORfl/e1/5AeP3wNR0RaWSLB+0SRD8yd7TQNACZUeX/G5NfHXHM/OgKHbzOo8UAKAoaHMSLpoOPKdEGPZD6vUNxTp/NBZGAC1GIvt3W82PkS6D6cImEYggoCivoAzYEXGADg6N4gAWOC4OsGIzyDgMCGhzQSKDzQHEiSDI5KjIyRFIIJGLlsUwaHJYIopNQ4EuTJwcrJ5pTizTZYMjcKkotqKsvFNW9YxszFWNWlKX4eQz49roQWlzSAw6AC4rhIczszppPwA=') format('woff2');
          }
        `}</style>
      </defs>
      {/* motion speed trail */}
      <line stroke="var(--accent)" strokeLinecap="round" strokeWidth="1.4" opacity="0.35" x1="1" y1="13" x2="6"  y2="13" />
      <line stroke="var(--accent)" strokeLinecap="round" strokeWidth="2"   opacity="0.65" x1="1" y1="16" x2="8"  y2="16" />
      <line stroke="var(--accent)" strokeLinecap="round" strokeWidth="1.4" opacity="0.35" x1="1" y1="19" x2="6"  y2="19" />
      {/* AO in Bebas Neue */}
      <text
        fill="var(--accent)"
        fontFamily="'BebasAO', 'Bebas Neue', sans-serif"
        fontSize="18"
        x="9"
        y="24"
        letterSpacing="-0.5"
      >
        AO
      </text>
    </svg>
  );
}
