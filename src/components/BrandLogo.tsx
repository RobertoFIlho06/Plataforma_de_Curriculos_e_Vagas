
type BrandLogoProps = {
  className?: string;
  variant?: "light" | "dark";
};

export default function BrandLogo({
  className = "h-10 w-10",
  variant = "dark",
}: BrandLogoProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl ${
        variant === "dark" ? "bg-[#0D3B2E]" : ""
      } p-1 ${className}`}
      aria-label="Logo JobTriva"
      role="img"
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className="h-full w-full"
        aria-hidden="true"
      >
        <path
          d="M10 37L33 21C36 19 40 20 42 23L48 30C50 33 49 37 46 39L12 58V43C12 40 12 39 10 37Z"
          fill="#22D68F"
        />
        <path
          d="M16 6C18 4 21 4 24 6L52 25C58 29 58 35 52 39L40 47V33L16 17C12 14 12 9 16 6Z"
          fill="#FFFFFF"
        />
        <path
          d="M40 33L52 25C58 29 58 35 52 39L40 47V33Z"
          fill="#D8EAE1"
        />
      </svg>
    </span>
  );
}
