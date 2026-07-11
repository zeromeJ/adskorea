import StatCard from "@/components/ui/StatCard";
import { trustNumbers } from "@/lib/constants";

export default function TrustNumbers() {
  return (
    <section className="bg-[var(--primary-deep)] px-5 py-12 lg:px-8">
      <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-4">
        {trustNumbers.map((stat) => (
          <StatCard dark key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}
