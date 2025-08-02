import type { SVGProps } from "react";

export function VigilLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Vigil Logo</title>
      <path
        d="M12 2.16333L3.52502 5.28833V11.1633C3.52502 16.2373 6.94502 20.9853 12 22.8363C17.055 20.9853 20.475 16.2373 20.475 11.1633V5.28833L12 2.16333Z"
        className="stroke-primary"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 10.5L12 14L15.5 10.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
