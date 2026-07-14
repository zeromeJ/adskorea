import {
  Boxes,
  Container,
  Cylinder,
  FlaskConical,
  Package,
  Warehouse,
} from "lucide-react";

const industryIcons = {
  FlaskConical,
  Package,
  Cylinder,
  Warehouse,
  Container,
  Boxes,
};

export type IndustryIconName = keyof typeof industryIcons;

type IndustryCardProps = {
  title: string;
  description?: string;
  icon: string;
};

export default function IndustryCard({
  title,
  description,
  icon,
}: IndustryCardProps) {
  const Icon = industryIcons[icon as IndustryIconName] ?? Boxes;

  return (
    <article className="w-full min-w-0 max-w-full rounded-lg border border-[var(--line)] bg-white p-4 transition duration-300 hover:border-[var(--sub-sage)] sm:p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-[var(--muted-surface)] text-[var(--primary)]">
        <Icon aria-hidden="true" size={30} strokeWidth={1.7} />
      </div>
      <h3 className="text-lg font-bold text-[var(--text)]">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-[var(--sub-text)]">
          {description}
        </p>
      ) : null}
    </article>
  );
}
