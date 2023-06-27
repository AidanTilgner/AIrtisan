import React from "react";
import { NotFoundBackdrop, UnderConstruction } from "./svgs/common";

export const VVibrantLogo = ({
  width = "100%",
  height = "100%",
}: {
  width: string | undefined;
  height: string | undefined;
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 513 513"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M379.389 0.636475H67.7371C30.8542 0.636475 0.954529 30.5361 0.954529 67.419V379.071C0.954529 415.954 30.8542 445.855 67.7371 445.855H379.389C416.271 445.855 446.172 415.954 446.172 379.071V67.419C446.172 30.5361 416.271 0.636475 379.389 0.636475Z"
        fill="#8709E8"
        fillOpacity="0.7"
      />
      <path
        d="M446.172 67.418H134.52C97.6371 67.418 67.7375 97.3176 67.7375 134.201V445.853C67.7375 482.735 97.6371 512.635 134.52 512.635H446.172C483.054 512.635 512.955 482.735 512.955 445.853V134.201C512.955 97.3176 483.054 67.418 446.172 67.418Z"
        fill="#1614DB"
      />
      <path
        d="M333.888 185.525C338.162 185.525 341.796 186.914 344.788 189.692C347.994 192.47 349.597 195.889 349.597 199.95C349.597 202.087 349.062 204.437 347.994 207.003L266.251 400.298C264.756 403.504 262.618 405.962 259.841 407.67C257.062 409.38 254.178 410.236 251.186 410.236C248.407 410.021 245.736 409.166 243.172 407.67C240.821 405.962 238.898 403.61 237.402 400.618L155.66 207.003C154.804 205.292 154.378 203.048 154.378 200.27C154.378 195.782 155.981 192.149 159.186 189.371C162.392 186.593 165.917 185.204 169.764 185.204C176.176 185.204 180.876 188.623 183.869 195.462L253.75 360.548L319.785 195.141C321.281 192.149 323.204 189.799 325.555 188.089C328.119 186.379 330.896 185.525 333.888 185.525ZM411.102 394.849C411.102 399.123 409.607 402.756 406.614 405.747C403.836 408.739 400.204 410.236 395.715 410.236C391.441 410.236 387.81 408.739 384.818 405.747C382.038 402.756 380.649 399.123 380.649 394.849V256.047C380.649 251.773 382.038 248.14 384.818 245.148C387.81 242.156 391.441 240.66 395.715 240.66C400.204 240.66 403.836 242.156 406.614 245.148C409.607 248.14 411.102 251.773 411.102 256.047V394.849ZM395.715 219.504C389.518 219.504 385.03 218.435 382.253 216.299C379.689 213.947 378.405 210.314 378.405 205.399V200.27C378.405 195.141 379.796 191.509 382.573 189.371C385.565 187.234 390.052 186.166 396.037 186.166C402.021 186.166 406.294 187.341 408.859 189.692C411.636 191.829 413.026 195.355 413.026 200.27V205.399C413.026 210.528 411.636 214.161 408.859 216.299C406.08 218.435 401.699 219.504 395.715 219.504Z"
        fill="white"
      />
    </svg>
  );
};

export const OnyxLogo = ({
  width = "100%",
  height = "100%",
}: {
  width: string | undefined;
  height: string | undefined;
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="512" height="512" rx="124" fill="black" />
      <path d="M192.349 397L115 256H192.349V397Z" fill="#1614DB" />
      <path
        d="M192.349 115V256H115L153.674 185.5L192.349 115Z"
        fill="#1B44BF"
      />
      <path d="M397 115H192.349L318.846 256L397 115Z" fill="#2256F2" />
      <path d="M192.349 256H318.846L192.349 115V256Z" fill="#120FA8" />
    </svg>
  );
};

export default {
  VVibrantLogo,
  OnyxLogo,
  NotFoundBackdrop,
  UnderConstruction,
};
