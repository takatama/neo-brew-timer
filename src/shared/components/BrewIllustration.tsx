import { useId } from "react";
import styles from "./BrewIllustration.module.css";

export function BrewIllustration({
  finished = false,
  animated = false,
  className = "",
}: {
  finished?: boolean;
  animated?: boolean;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      className={`${styles.scene} ${animated ? styles.animated : ""} ${className}`}
      viewBox="0 0 240 240"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${id}-glass`}
          x1="70"
          y1="120"
          x2="175"
          y2="220"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFFDF7" stopOpacity=".95" />
          <stop offset="1" stopColor="#DFE6DB" stopOpacity=".6" />
        </linearGradient>
        <linearGradient
          id={`${id}-coffee`}
          x1="80"
          y1="165"
          x2="170"
          y2="215"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#AE7550" />
          <stop offset="1" stopColor="#60402E" />
        </linearGradient>
        <linearGradient
          id={`${id}-ceramic`}
          x1="70"
          y1="60"
          x2="160"
          y2="115"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDFBF2" />
          <stop offset="1" stopColor="#E5DCD0" />
        </linearGradient>
        <clipPath id={`${id}-flask`}>
          <path d="M98 121h46l3 22 21 47c8 17-3 25-45 25-40 0-53-8-44-25l17-47 2-22Z" />
        </clipPath>
      </defs>
      <ellipse cx="123" cy="220" rx="78" ry="9" fill="#314D41" opacity=".07" />
      {finished ? (
        <>
          <path
            d="M175 135h11c27 0 27 39 0 39h-10"
            stroke="#8F7861"
            strokeWidth="7"
          />
          <path
            d="M62 130h112v41c0 30-22 47-55 47s-57-17-57-47v-41Z"
            fill={`url(#${id}-ceramic)`}
            stroke="#968774"
            strokeWidth="1.5"
          />
          <ellipse
            cx="118"
            cy="130"
            rx="56"
            ry="13"
            fill="#B8A893"
            stroke="#968774"
            strokeWidth="1.5"
          />
          <ellipse
            cx="118"
            cy="130"
            rx="48"
            ry="9"
            fill={`url(#${id}-coffee)`}
          />
          <path
            d="M76 151v17c0 16 8 26 18 31"
            stroke="#FFFDF8"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <g
            className={styles.steam}
            stroke="#8E9C88"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M97 103c-17-15 12-22 0-40" />
            <path d="M120 96c-17-15 12-22 0-40" />
            <path d="M143 104c-17-15 12-22 0-40" />
          </g>
          <ellipse cx="120" cy="220" rx="76" ry="5" stroke="#A69B85" />
        </>
      ) : (
        <>
          <path
            d="M145 141h16c29 0 29 44 6 47"
            stroke="#8F9180"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M98 121h46l3 22 21 47c8 17-3 25-45 25-40 0-53-8-44-25l17-47 2-22Z"
            fill={`url(#${id}-glass)`}
            stroke="#909A87"
            strokeWidth="1.5"
          />
          <g clipPath={`url(#${id}-flask)`}>
            <path
              d="M75 174q25-9 49 0t50 0v49H70l5-49Z"
              fill={`url(#${id}-coffee)`}
            />
            <ellipse
              cx="124"
              cy="175"
              rx="48"
              ry="7"
              fill="#B78459"
              opacity=".65"
            />
          </g>
          <path
            d="m97 152-13 36c-4 12 0 17 15 20"
            stroke="#FFFDF8"
            strokeWidth="3"
            strokeLinecap="round"
            opacity=".85"
          />
          <path
            d="M117 191h17M121 183h13M121 199h13"
            stroke="#DCC4A8"
            strokeWidth="1.2"
          />
          <path
            d="M62 71h121l-49 49h-22L62 71Z"
            fill={`url(#${id}-ceramic)`}
            stroke="#A09480"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="m79 77 37 38m-19-37 23 37m1-37 1 37m24-37-19 37m36-37-32 37"
            stroke="#D2C8B5"
            strokeWidth="2"
          />
          <path
            d="M61 72h124M94 122h56"
            stroke="#9A8E76"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <ellipse
            cx="123"
            cy="71"
            rx="61"
            ry="8"
            fill="#F3EEE2"
            stroke="#A09480"
            strokeWidth="1.5"
          />
          <ellipse
            cx="123"
            cy="71"
            rx="49"
            ry="4"
            fill="#A17F5C"
            opacity=".55"
          />
          <g className={styles.drops} fill="#A2754E">
            <ellipse cx="122" cy="131" rx="1.7" ry="3" />
            <ellipse cx="122" cy="145" rx="1.5" ry="2.5" />
          </g>
          <path
            className={styles.steam}
            d="M120 49c-12-11 10-17 0-30"
            stroke="#9EAA92"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M188 67c8-2 16 1 22 5M198 53l7-5M195 91l10 4"
            stroke="#BF9168"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}
