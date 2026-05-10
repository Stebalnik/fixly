import Image from "next/image";

type CategoryIconProps = {
  icon: string;
  title: string;
  size?: number;
};

export default function CategoryIcon({
  icon,
  title,
  size = 44,
}: CategoryIconProps) {
  return (
    <span
      className="category-icon-wrap"
      aria-label={title}
      role="img"
    >
      <Image
        src={`/category-icons/${icon}.svg`}
        alt={title}
        width={size}
        height={size}
        className="category-icon-img"
        unoptimized
        priority={false}
      />
    </span>
  );
}